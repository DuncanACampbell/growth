import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { parseDailyConversationLocalDate } from './local-date';
import { getDailyConversationFinalThoughtForDate } from './persist';

/** Today's Daily Conversation thought for Home. Isolated from guided-theme reads. */
export const getTodaysDailyConversationThought = onCall(
  {
    region: 'us-central1',
  },
  async (request): Promise<{ finalThought: string | null }> => {
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'You must be signed in to use Growth.',
      );
    }

    const data = request.data as { localDate?: unknown };
    const localDate = parseDailyConversationLocalDate(data.localDate);
    const finalThought = await getDailyConversationFinalThoughtForDate({
      uid: request.auth.uid,
      localDate,
    });
    return { finalThought };
  },
);
