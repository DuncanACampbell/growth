import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { parseDailyConversationLocalDate } from './local-date';
import { createDailyConversationOpening } from './opening';
import { getMostRecentPreviousDailyConversationMemory } from './persist';
import { createInitialDailyConversationState } from './session';
import type { GetDailyConversationOpeningResponse } from './types';

/** Experimental Daily Conversation opening. Does not use guided-exercise opening logic. */
export const getDailyConversationOpening = onCall(
  {
    region: 'us-central1',
  },
  async (request): Promise<GetDailyConversationOpeningResponse> => {
    // Cloud Run permits invocation so Firebase callable requests can reach this
    // handler. User authorization is enforced here using Firebase Auth.
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'You must be signed in to use Growth.',
      );
    }

    const data = request.data as { localDate?: unknown };
    const localDate = parseDailyConversationLocalDate(data.localDate);
    const previousMemory = await getMostRecentPreviousDailyConversationMemory({
      uid: request.auth.uid,
      localDate,
    });
    const message = createDailyConversationOpening(previousMemory);

    return {
      message,
      state: createInitialDailyConversationState(),
      previousMemory,
    };
  },
);
