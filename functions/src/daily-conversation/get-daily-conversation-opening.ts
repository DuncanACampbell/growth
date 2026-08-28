import { logger } from 'firebase-functions';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { logCallableFailure } from '../callable-error';
import { parseDailyConversationLocalDate } from './local-date';
import { createDailyConversationOpening } from './opening';
import {
  getMostRecentPreviousDailyConversationMemory,
  peekTodaysDailyConversationDocument,
} from './persist';
import { createInitialDailyConversationState } from './session';
import type { DailyConversationMemory } from './memory';
import type { GetDailyConversationOpeningResponse } from './types';

const OPENING_FAILED =
  'Couldn’t start today’s conversation. Please try again.';

function jsonSafeMemory(
  memory: DailyConversationMemory | null,
): DailyConversationMemory | null {
  if (!memory) {
    return null;
  }
  const safe: DailyConversationMemory = {
    topic: memory.topic,
    theme: memory.theme,
    pattern: memory.pattern,
    situation: memory.situation,
    insight: memory.insight,
    outcomeType: memory.outcomeType,
    outcome: memory.outcome,
    followUp: memory.followUp,
    finalThought: memory.finalThought,
    completedAt: memory.completedAt,
  };
  JSON.parse(JSON.stringify(safe));
  return safe;
}

function jsonSafeResponse(
  response: GetDailyConversationOpeningResponse,
): GetDailyConversationOpeningResponse {
  return JSON.parse(JSON.stringify(response)) as GetDailyConversationOpeningResponse;
}

/** Experimental Daily Conversation opening. Does not use guided-exercise opening logic. */
export const getDailyConversationOpening = onCall(
  {
    region: 'us-central1',
  },
  async (request): Promise<GetDailyConversationOpeningResponse> => {
    let step = 'start';
    logger.info('[DailyConversationOpening] start');

    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'You must be signed in to use Growth.',
      );
    }
    logger.info('[DailyConversationOpening] uid present');

    try {
      step = 'date';
      const data =
        request.data && typeof request.data === 'object'
          ? (request.data as { localDate?: unknown })
          : {};
      const localDate = parseDailyConversationLocalDate(data.localDate);
      logger.info(`[DailyConversationOpening] date resolved: ${localDate}`);

      step = 'today-document';
      const todayStatus = await peekTodaysDailyConversationDocument({
        uid: request.auth.uid,
        localDate,
      });
      logger.info(
        `[DailyConversationOpening] today document: ${todayStatus === 'found' ? 'found' : todayStatus === 'not-found' ? 'not found' : 'ignored-invalid'}`,
      );

      step = 'previous-memory';
      const previous = await getMostRecentPreviousDailyConversationMemory({
        uid: request.auth.uid,
        localDate,
      });
      const previousLabel =
        previous.status === 'found'
          ? 'found'
          : previous.status === 'not-found'
            ? 'not found'
            : 'ignored-invalid';
      logger.info(
        `[DailyConversationOpening] previous memory: ${previousLabel}`,
      );

      step = 'opening-generation';
      const previousMemory = jsonSafeMemory(previous.memory);
      const message = createDailyConversationOpening(previousMemory);

      step = 'serialize';
      const response = jsonSafeResponse({
        message,
        state: createInitialDailyConversationState(),
        previousMemory,
      });
      logger.info('[DailyConversationOpening] returning opening');
      return response;
    } catch (caught) {
      if (caught instanceof HttpsError) {
        throw caught;
      }
      logCallableFailure('getDailyConversationOpening', caught, {
        uid: request.auth.uid,
      });
      logger.error(`[DailyConversationOpening] failed at ${step}`, {
        name: caught instanceof Error ? caught.name : typeof caught,
        message: caught instanceof Error ? caught.message : String(caught),
        stack: caught instanceof Error ? caught.stack : undefined,
      });
      throw new HttpsError('internal', OPENING_FAILED);
    }
  },
);
