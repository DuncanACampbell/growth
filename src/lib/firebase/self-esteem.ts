import { httpsCallable } from 'firebase/functions';

import { getFirebaseFunctions } from './client';

export type SendSelfEsteemMessageInput = {
  message: string;
  sessionId?: string;
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
  if (!message) {
    throw new Error('Write a message before sending.');
  }

  const callable = httpsCallable<
    SendSelfEsteemMessageInput,
    SendSelfEsteemMessageResult
  >(getFirebaseFunctions(), 'sendSelfEsteemMessage');

  try {
    const result = await callable({
      message,
      sessionId: input.sessionId,
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
