import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { generateSelfEsteemReply } from './llm';

type SendSelfEsteemMessageRequest = {
  message?: unknown;
  sessionId?: unknown;
};

export const sendSelfEsteemMessage = onCall(
  {
    region: 'us-central1',
    // No secrets yet. Later: secrets: [llmApiKey] from firebase-functions/params.
  },
  async (request) => {
    const data = request.data as SendSelfEsteemMessageRequest;
    const message = typeof data.message === 'string' ? data.message.trim() : '';
    const sessionId =
      typeof data.sessionId === 'string' && data.sessionId.trim().length > 0
        ? data.sessionId.trim()
        : undefined;

    if (!message) {
      throw new HttpsError('invalid-argument', 'message is required.');
    }

    const reply = await generateSelfEsteemReply({ message, sessionId });
    return { reply };
  },
);
