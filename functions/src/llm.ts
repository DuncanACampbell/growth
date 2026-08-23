import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import OpenAI from 'openai';

/** Bound on the callable so the emulator loads `functions/.secret.local`. */
export const openaiApiKey = defineSecret('OPENAI_API_KEY');

const MODEL = 'gpt-4.1-mini';

const REPLY_ONLY_INSTRUCTION =
  'Reply only with the next conversational message to the user. Do not output structured session fields, JSON, or internal notes.';

export type LlmChatTurn = {
  role: 'user' | 'assistant';
  text: string;
};

export async function generateSelfEsteemReply(input: {
  systemPrompt: string;
  history: LlmChatTurn[];
  message: string;
}): Promise<string> {
  const apiKey = openaiApiKey.value();
  if (!apiKey) {
    logger.error('OPENAI_API_KEY is missing in the Functions runtime.');
    throw new Error('LLM_UNAVAILABLE');
  }

  const client = new OpenAI({ apiKey });
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `${input.systemPrompt.trim()}\n\n${REPLY_ONLY_INSTRUCTION}`,
    },
    ...input.history.map((turn) => ({
      role: turn.role,
      content: turn.text,
    })),
    { role: 'user', content: input.message },
  ];

  try {
    const completion = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 400,
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      logger.error('OpenAI returned an empty message.', {
        id: completion.id,
        finishReason: completion.choices[0]?.finish_reason ?? null,
      });
      throw new Error('LLM_UNAVAILABLE');
    }

    return text;
  } catch (caught) {
    if (caught instanceof Error && caught.message === 'LLM_UNAVAILABLE') {
      throw caught;
    }

    const status =
      caught instanceof OpenAI.APIError ? caught.status : undefined;
    logger.error('OpenAI request failed.', {
      status,
      name: caught instanceof Error ? caught.name : 'unknown',
    });
    throw new Error('LLM_UNAVAILABLE');
  }
}
