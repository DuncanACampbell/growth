import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import OpenAI from 'openai';

import { CONVERSATION_PHASES, type ConversationPhase } from './guides/types';
import type { GuidedSessionTurn } from './session';

/** Bound on the callable so the emulator loads `functions/.secret.local`. */
export const openaiApiKey = defineSecret('OPENAI_API_KEY');

const MODEL = 'gpt-4.1-mini';

const STRUCTURED_OUTPUT_INSTRUCTION = `Return a JSON object with:
- reply: the user-facing message only (no JSON in this field)
- phase: one of ${CONVERSATION_PHASES.join(', ')}
- isComplete: true when today's exercise is finished
- finalStatement: the one-sentence takeaway when complete, otherwise null

Never put JSON in the chat UI text. The reply field is what the user reads.`;

export type LlmChatTurn = {
  role: 'user' | 'assistant';
  text: string;
};

const SESSION_TURN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['reply', 'phase', 'isComplete', 'finalStatement'],
  properties: {
    reply: { type: 'string' },
    phase: { type: 'string', enum: [...CONVERSATION_PHASES] },
    isComplete: { type: 'boolean' },
    finalStatement: { type: ['string', 'null'] },
  },
} as const;

function asConversationPhase(value: unknown): ConversationPhase {
  if (typeof value === 'string' && CONVERSATION_PHASES.includes(value as ConversationPhase)) {
    return value as ConversationPhase;
  }
  return 'understanding';
}

function parseTurn(raw: unknown): GuidedSessionTurn | null {
  if (raw === null || typeof raw !== 'object') {
    return null;
  }
  const record = raw as {
    reply?: unknown;
    phase?: unknown;
    isComplete?: unknown;
    finalStatement?: unknown;
  };
  if (typeof record.reply !== 'string' || record.reply.trim().length === 0) {
    return null;
  }
  const finalStatement =
    typeof record.finalStatement === 'string' && record.finalStatement.trim().length > 0
      ? record.finalStatement.trim()
      : null;
  return {
    reply: record.reply.trim(),
    phase: asConversationPhase(record.phase),
    isComplete: record.isComplete === true,
    finalStatement,
  };
}

export async function generateSelfEsteemReply(input: {
  systemPrompt: string;
  history: LlmChatTurn[];
  message: string;
}): Promise<GuidedSessionTurn> {
  const apiKey = openaiApiKey.value();
  if (!apiKey) {
    logger.error('OPENAI_API_KEY is missing in the Functions runtime.');
    throw new Error('LLM_UNAVAILABLE');
  }

  const client = new OpenAI({ apiKey });
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: 'system',
      content: `${input.systemPrompt.trim()}\n\n${STRUCTURED_OUTPUT_INSTRUCTION}`,
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
      max_tokens: 700,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'guided_session_turn',
          strict: true,
          schema: SESSION_TURN_SCHEMA,
        },
      },
    });

    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      logger.error('OpenAI returned an empty message.', {
        id: completion.id,
        finishReason: completion.choices[0]?.finish_reason ?? null,
      });
      throw new Error('LLM_UNAVAILABLE');
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(text) as unknown;
    } catch {
      logger.error('OpenAI returned non-JSON content.');
      throw new Error('LLM_UNAVAILABLE');
    }

    const turn = parseTurn(parsed);
    if (!turn) {
      logger.error('OpenAI JSON did not match the session-turn shape.');
      throw new Error('LLM_UNAVAILABLE');
    }

    return turn;
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
