import { httpsCallable } from 'firebase/functions';

import { getFirebaseFunctions } from './client';

export type SelfEsteemChatTurn = {
  role: 'user' | 'assistant';
  text: string;
};

export type SendSelfEsteemMessageInput = {
  message: string;
  sessionId?: string;
  guidePrompt: string;
  history: SelfEsteemChatTurn[];
};

export type SendSelfEsteemMessageResult = {
  reply: string;
};

/**
 * Client entry for Self-Esteem Day 1. The UI should not know about LLM providers.
 */
export async function sendSelfEsteemMessage(
  input: SendSelfEsteemMessageInput,
): Promise<SendSelfEsteemMessageResult> {
  const message = input.message.trim();
  const guidePrompt = input.guidePrompt.trim();
  if (!message) {
    throw new Error('Write a message before sending.');
  }
  if (!guidePrompt) {
    throw new Error('This session is missing its guide prompt.');
  }

  const callable = httpsCallable<
    SendSelfEsteemMessageInput,
    SendSelfEsteemMessageResult
  >(getFirebaseFunctions(), 'sendSelfEsteemMessage');

  try {
    const result = await callable({
      message,
      sessionId: input.sessionId,
      guidePrompt,
      history: input.history,
    });

    const reply = result.data.reply?.trim();
    if (!reply) {
      throw new Error('The backend returned an empty reply.');
    }

    return { reply };
  } catch (caught) {
    if (caught instanceof Error && caught.message) {
      throw caught;
    }
    throw new Error('Could not reach the Firebase backend.');
  }
}
