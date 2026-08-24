import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions';

import { assembleSystemPrompt } from './guides/assemble';
import {
  getDailyExercise,
  getGlobalConversationGuide,
  getThemeGuide,
} from './guides/index';
import { generateSelfEsteemReply, openaiApiKey, type LlmChatTurn } from './llm';
import {
  applyCompletionOverride,
  countUserTurns,
  MAX_USER_TURNS,
  pacingInstructions,
} from './session';

const MAX_MESSAGE_LENGTH = 4000;
const MAX_HISTORY_ITEMS = 40;
const GENERIC_LLM_ERROR = 'The guide could not reply. Please try again.';

type SendSelfEsteemMessageRequest = {
  message?: unknown;
  sessionId?: unknown;
  themeId?: unknown;
  exerciseId?: unknown;
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
    const themeId = typeof data.themeId === 'string' ? data.themeId.trim() : '';
    const exerciseId =
      typeof data.exerciseId === 'string' ? data.exerciseId.trim() : '';
    const sessionId =
      typeof data.sessionId === 'string' && data.sessionId.trim().length > 0
        ? data.sessionId.trim()
        : undefined;

    if (!message || message.length > MAX_MESSAGE_LENGTH) {
      throw new HttpsError('invalid-argument', 'message is required.');
    }
    if (!themeId) {
      throw new HttpsError('invalid-argument', 'themeId is required.');
    }
    if (!exerciseId) {
      throw new HttpsError('invalid-argument', 'exerciseId is required.');
    }

    const themeGuide = getThemeGuide(themeId);
    const exercise = getDailyExercise(themeId, exerciseId);
    if (!themeGuide || !exercise) {
      throw new HttpsError('not-found', 'Unknown theme or exercise.');
    }

    const history = parseHistory(data.history);
    const userTurnNumber = countUserTurns(history) + 1;
    if (userTurnNumber > MAX_USER_TURNS) {
      throw new HttpsError(
        'failed-precondition',
        'This session is already complete.',
      );
    }
    const mustComplete = userTurnNumber >= MAX_USER_TURNS;

    const systemPrompt = assembleSystemPrompt({
      globalGuide: getGlobalConversationGuide(),
      themeGuide,
      exercise,
      pacing: pacingInstructions(userTurnNumber, mustComplete),
    });

    try {
      const turn = await generateSelfEsteemReply({
        systemPrompt,
        history,
        message,
      });
      const result = applyCompletionOverride(
        turn,
        mustComplete || turn.isComplete,
      );
      return {
        reply: result.reply,
        isComplete: result.isComplete,
        finalStatement: result.finalStatement,
      };
    } catch (caught) {
      logger.error('Self-esteem LLM call failed.', {
        sessionId: sessionId ?? null,
        themeId,
        exerciseId,
        userTurnNumber,
      });
      if (caught instanceof HttpsError) {
        throw caught;
      }
      throw new HttpsError('unavailable', GENERIC_LLM_ERROR);
    }
  },
);
