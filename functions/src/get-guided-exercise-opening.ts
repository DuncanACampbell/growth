import { HttpsError, onCall } from 'firebase-functions/v2/https';

import {
  logCallableFailure,
  OPENING_LOAD_FAILED,
  rethrowCallableError,
} from './callable-error';
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
    // Cloud Run permits invocation so Firebase callable requests can reach this
    // handler. User authorization is enforced here using Firebase Auth.
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'You must be signed in to use Growth.',
      );
    }
    const uid = request.auth.uid;

    const data = request.data as GetGuidedExerciseOpeningRequest;
    const themeId = typeof data.themeId === 'string' ? data.themeId.trim() : '';
    const exerciseId =
      typeof data.exerciseId === 'string' ? data.exerciseId.trim() : '';

    try {
      if (!themeId) {
        throw new HttpsError('invalid-argument', 'themeId is required.');
      }
      if (!exerciseId) {
        throw new HttpsError('invalid-argument', 'exerciseId is required.');
      }

      const exercise = getDailyExercise(themeId, exerciseId);
      const opening = exercise?.openingPrompt?.trim() ?? '';
      if (!exercise || !opening) {
        throw new HttpsError('not-found', 'Unknown theme or exercise.');
      }

      return { opening };
    } catch (error) {
      logCallableFailure('getGuidedExerciseOpening', error, {
        uid,
        themeId: themeId || null,
        exerciseId: exerciseId || null,
      });
      rethrowCallableError(
        error,
        OPENING_LOAD_FAILED,
        'Could not load guided exercise opening',
      );
    }
  },
);
