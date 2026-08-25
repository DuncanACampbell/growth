import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { getDailyExercise } from './guides/index';

type GetGuidedExerciseOpeningRequest = {
  themeId?: unknown;
  exerciseId?: unknown;
};

/** Returns only the user-facing opening. Does not expose other guide text. */
export const getGuidedExerciseOpening = onCall(
  {
    region: 'us-central1',
  },
  (request) => {
    const data = request.data as GetGuidedExerciseOpeningRequest;
    const themeId = typeof data.themeId === 'string' ? data.themeId.trim() : '';
    const exerciseId =
      typeof data.exerciseId === 'string' ? data.exerciseId.trim() : '';

    if (!themeId) {
      throw new HttpsError('invalid-argument', 'themeId is required.');
    }
    if (!exerciseId) {
      throw new HttpsError('invalid-argument', 'exerciseId is required.');
    }

    const exercise = getDailyExercise(themeId, exerciseId);
    const opening = exercise?.openingPrompt.trim() ?? '';
    if (!exercise || !opening) {
      throw new HttpsError('not-found', 'Unknown theme or exercise.');
    }

    return { opening };
  },
);
