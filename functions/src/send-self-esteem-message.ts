import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

import { generateSelfEsteemReply, openaiApiKey, type LlmChatTurn } from './llm';

const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_ITEMS = 40;
const GENERIC_LLM_ERROR = 'The guide could not reply. Please try again.';

type SendSelfEsteemMessageRequest = {
  message?: unknown;
  sessionId?: unknown;
  guidePrompt?: unknown;
  history?: unknown;
};

function parseHistory(value: unknown): LlmChatTurn[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new HttpsError('invalid-argument', 'history must be an array.');
  }
  if (value.length > MAX_HISTORY_ITEMS) {
    throw new HttpsError('invalid-argument', 'history is too long.');
  }

  const history: LlmChatTurn[] = [];
  for (const item of value) {
    if (item === null || typeof item !== 'object') {
      throw new HttpsError('invalid-argument', 'history items are invalid.');
    }
    const record = item as { role?: unknown; text?: unknown };
    if (record.role !== 'user' && record.role !== 'assistant') {
      throw new HttpsError('invalid-argument', 'history roles are invalid.');
    }
    if (typeof record.text !== 'string') {
      throw new HttpsError('invalid-argument', 'history text is invalid.');
    }
    const text = record.text.trim();
    if (!text || text.length > MAX_MESSAGE_LENGTH) {
      throw new HttpsError('invalid-argument', 'history text is invalid.');
    }
    history.push({ role: record.role, text });
  }
  return history;
}

export const sendSelfEsteemMessage = onCall(
  {
    region: 'us-central1',
    secrets: [openaiApiKey],
  },
  async (request) => {
    const data = request.data as SendSelfEsteemMessageRequest;
    const message = typeof data.message === 'string' ? data.message.trim() : '';
    const guidePrompt =
      typeof data.guidePrompt === 'string' ? data.guidePrompt.trim() : '';
    const sessionId =
      typeof data.sessionId === 'string' && data.sessionId.trim().length > 0
        ? data.sessionId.trim()
        : undefined;

    if (!message || message.length > MAX_MESSAGE_LENGTH) {
      throw new HttpsError('invalid-argument', 'message is required.');
    }
    if (!guidePrompt) {
      throw new HttpsError('invalid-argument', 'guidePrompt is required.');
    }

    const history = parseHistory(data.history);

    try {
      const reply = await generateSelfEsteemReply({
        systemPrompt: guidePrompt,
        history,
        message,
      });
      return { reply };
    } catch (caught) {
      logger.error('Self-esteem LLM call failed.', {
        sessionId: sessionId ?? null,
      });
      if (caught instanceof HttpsError) {
        throw caught;
      }
      throw new HttpsError('unavailable', GENERIC_LLM_ERROR);
    }
  },
);
