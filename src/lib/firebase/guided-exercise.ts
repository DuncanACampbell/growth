import { httpsCallable } from 'firebase/functions';

import { getFirebaseFunctions } from './client';

import { isNetworkError, USER_FACING } from '@/lib/errors/user-facing';
import type { ProgrammeMemoryRecord } from '@/types/models';

export type GuidedExerciseChatTurn = {
  role: 'user' | 'assistant';
  text: string;
};

export type SendGuidedExerciseMessageInput = {
  message: string;
  themeId: string;
  exerciseId: string;
  sessionId?: string;
  history: GuidedExerciseChatTurn[];
  previousMemory?: ProgrammeMemoryRecord[];
};

export type SendGuidedExerciseMessageResult = {
  reply: string;
  isComplete: boolean;
  finalStatement: string | null;
  memory: Omit<ProgrammeMemoryRecord, 'themeId' | 'exerciseId' | 'finalStatement' | 'completedAt'> | null;
};

export type GetGuidedExerciseOpeningInput = {
  themeId: string;
  exerciseId: string;
};

export type GetGuidedExerciseOpeningResult = {
  opening: string;
};

const OPENING_RETRY = 'Couldn’t load today’s opening. Please try again.';
const GUIDE_RETRY = 'The guide could not reply. Please try again.';

function errorCode(caught: unknown): string {
  if (caught && typeof caught === 'object' && 'code' in caught) {
    return String((caught as { code: unknown }).code);
  }
  return '';
}

function errorMessage(caught: unknown): string {
  if (caught instanceof Error && caught.message.trim()) {
    return caught.message.trim();
  }
  return '';
}

export function toUserFacingGuideError(
  caught: unknown,
  kind: 'send' | 'opening',
): string {
  const code = errorCode(caught);
  const message = errorMessage(caught);

  if (isNetworkError(caught)) {
    return USER_FACING.offline;
  }
  if (code === 'functions/failed-precondition' || message.includes('already complete')) {
    return 'This conversation is already finished.';
  }
  if (kind === 'opening') {
    return OPENING_RETRY;
  }
  if (message === GUIDE_RETRY || message.includes('could not reply')) {
    return GUIDE_RETRY;
  }
  return GUIDE_RETRY;
}

/**
 * User-facing opening for an exercise. Does not expose guide/prompt text.
 */
export async function getGuidedExerciseOpening(
  input: GetGuidedExerciseOpeningInput,
): Promise<GetGuidedExerciseOpeningResult> {
  const themeId = input.themeId.trim();
  const exerciseId = input.exerciseId.trim();
  if (!themeId || !exerciseId) {
    throw new Error(OPENING_RETRY);
  }

  const callable = httpsCallable<
    GetGuidedExerciseOpeningInput,
    GetGuidedExerciseOpeningResult
  >(getFirebaseFunctions(), 'getGuidedExerciseOpening');

  try {
    const result = await callable({ themeId, exerciseId });
    const opening = result.data.opening?.trim();
    if (!opening) {
      throw new Error(OPENING_RETRY);
    }
    return { opening };
  } catch (caught) {
    throw new Error(toUserFacingGuideError(caught, 'opening'));
  }
}

/**
 * Client entry for a guided daily exercise. The UI should not know about
 * LLM providers or prompt text — Firebase loads the guides from themeId + exerciseId.
 */
export async function sendGuidedExerciseMessage(
  input: SendGuidedExerciseMessageInput,
): Promise<SendGuidedExerciseMessageResult> {
  const message = input.message.trim();
  const themeId = input.themeId.trim();
  const exerciseId = input.exerciseId.trim();
  if (!message) {
    throw new Error('Write a message before sending.');
  }
  if (!themeId || !exerciseId) {
    throw new Error(GUIDE_RETRY);
  }

  const callable = httpsCallable<
    SendGuidedExerciseMessageInput,
    SendGuidedExerciseMessageResult
  >(getFirebaseFunctions(), 'sendGuidedExerciseMessage');

  try {
    const result = await callable({
      message,
      themeId,
      exerciseId,
      sessionId: input.sessionId,
      history: input.history,
      previousMemory: input.previousMemory,
    });

    const reply = result.data.reply?.trim();
    if (!reply) {
      throw new Error(GUIDE_RETRY);
    }

    const isComplete = result.data.isComplete === true;
    const finalStatement = result.data.finalStatement?.trim() || null;
    if (isComplete && !finalStatement) {
      throw new Error(GUIDE_RETRY);
    }

    return {
      reply,
      isComplete,
      finalStatement,
      memory: parseReturnedMemory(result.data.memory),
    };
  } catch (caught) {
    throw new Error(toUserFacingGuideError(caught, 'send'));
  }
}

function parseReturnedMemory(value: unknown): SendGuidedExerciseMessageResult['memory'] {
  if (value === null || value === undefined || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const topic = typeof record.topic === 'string' ? record.topic.trim() : '';
  const pattern = typeof record.pattern === 'string' ? record.pattern.trim() : '';
  const reframe = typeof record.reframe === 'string' ? record.reframe.trim() : '';
  const memoryNote =
    typeof record.memoryNote === 'string' ? record.memoryNote.trim() : '';
  if (!topic || !pattern || !reframe || !memoryNote) {
    return null;
  }
  return { topic, pattern, reframe, memoryNote };
}
