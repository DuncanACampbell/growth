import { httpsCallable } from 'firebase/functions';

import { getFirebaseFunctions } from './client';

export type SelfEsteemChatTurn = {
  role: 'user' | 'assistant';
  text: string;
};

export type SendSelfEsteemMessageInput = {
  message: string;
  themeId: string;
  exerciseId: string;
  sessionId?: string;
  history: SelfEsteemChatTurn[];
};

export type SendSelfEsteemMessageResult = {
  reply: string;
  isComplete: boolean;
  finalStatement: string | null;
};

export type GetSelfEsteemExerciseOpeningInput = {
  themeId: string;
  exerciseId: string;
};

export type GetSelfEsteemExerciseOpeningResult = {
  opening: string;
};

/**
 * User-facing opening for an exercise. Does not expose guide/prompt text.
 */
export async function getSelfEsteemExerciseOpening(
  input: GetSelfEsteemExerciseOpeningInput,
): Promise<GetSelfEsteemExerciseOpeningResult> {
  const themeId = input.themeId.trim();
  const exerciseId = input.exerciseId.trim();
  if (!themeId || !exerciseId) {
    throw new Error('This session is missing its exercise identity.');
  }

  const callable = httpsCallable<
    GetSelfEsteemExerciseOpeningInput,
    GetSelfEsteemExerciseOpeningResult
  >(getFirebaseFunctions(), 'getSelfEsteemExerciseOpening');

  try {
    const result = await callable({ themeId, exerciseId });
    const opening = result.data.opening?.trim();
    if (!opening) {
      throw new Error('The backend returned an empty opening.');
    }
    return { opening };
  } catch (caught) {
    if (caught instanceof Error && caught.message) {
      throw caught;
    }
    throw new Error('Could not reach the Firebase backend.');
  }
}

/**
 * Client entry for a Self-Esteem daily exercise. The UI should not know about
 * LLM providers or prompt text — Firebase loads the guides from themeId + exerciseId.
 */
export async function sendSelfEsteemMessage(
  input: SendSelfEsteemMessageInput,
): Promise<SendSelfEsteemMessageResult> {
  const message = input.message.trim();
  const themeId = input.themeId.trim();
  const exerciseId = input.exerciseId.trim();
  if (!message) {
    throw new Error('Write a message before sending.');
  }
  if (!themeId || !exerciseId) {
    throw new Error('This session is missing its exercise identity.');
  }

  const callable = httpsCallable<
    SendSelfEsteemMessageInput,
    SendSelfEsteemMessageResult
  >(getFirebaseFunctions(), 'sendSelfEsteemMessage');

  try {
    const result = await callable({
      message,
      themeId,
      exerciseId,
      sessionId: input.sessionId,
      history: input.history,
    });

    const reply = result.data.reply?.trim();
    if (!reply) {
      throw new Error('The backend returned an empty reply.');
    }

    return {
      reply,
      isComplete: result.data.isComplete === true,
      finalStatement: result.data.finalStatement?.trim() || null,
    };
  } catch (caught) {
    if (caught instanceof Error && caught.message) {
      throw caught;
    }
    throw new Error('Could not reach the Firebase backend.');
  }
}
