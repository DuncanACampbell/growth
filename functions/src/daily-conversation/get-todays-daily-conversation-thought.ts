import { logger } from 'firebase-functions';
import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { logCallableFailure } from '../callable-error';
import { parseDailyConversationLocalDate } from './local-date';
import { getDailyConversationFinalThoughtForDate } from './persist';

/** Today's Daily Conversation thought for Home. Isolated from guided-theme reads. */
export const getTodaysDailyConversationThought = onCall(
  {
    region: 'us-central1',
  },
  async (request): Promise<{ finalThought: string | null }> => {
    let step = 'start';
    logger.info('[DailyConversationThought] start');

    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'You must be signed in to use Growth.',
      );
    }
    logger.info('[DailyConversationThought] uid present');

    try {
      step = 'date';
      const data =
        request.data && typeof request.data === 'object'
          ? (request.data as { localDate?: unknown })
          : {};
      const localDate = parseDailyConversationLocalDate(data.localDate);
      logger.info(`[DailyConversationThought] date resolved: ${localDate}`);

      step = 'document';
      const finalThought = await getDailyConversationFinalThoughtForDate({
        uid: request.auth.uid,
        localDate,
      });
      logger.info(
        `[DailyConversationThought] document ${finalThought ? 'found' : 'not found'}`,
      );
      logger.info(
        `[DailyConversationThought] finalThought ${finalThought ? 'present' : 'absent'}`,
      );

      step = 'serialize';
      const response = { finalThought: finalThought ?? null };
      JSON.parse(JSON.stringify(response));
      logger.info('[DailyConversationThought] returning');
      return response;
    } catch (caught) {
      if (caught instanceof HttpsError) {
        throw caught;
      }
      logCallableFailure('getTodaysDailyConversationThought', caught, {
        uid: request.auth.uid,
      });
      logger.error(`[DailyConversationThought] failed at ${step}`, {
        name: caught instanceof Error ? caught.name : typeof caught,
        message: caught instanceof Error ? caught.message : String(caught),
        stack: caught instanceof Error ? caught.stack : undefined,
      });
      return { finalThought: null };
    }
  },
);
