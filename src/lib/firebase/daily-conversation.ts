import { httpsCallable } from 'firebase/functions';

import { getFirebaseFunctions } from './client';
import { isNetworkError, logTechnicalError, USER_FACING } from '@/lib/errors/user-facing';

export type DailyConversationPhase =
  | 'open'
  | 'understand'
  | 'focus'
  | 'help'
  | 'close';

export type DailyConversationTheme = 'self-esteem' | 'money';

export type DailyConversationPatternId =
  | 'harsh-self-criticism'
  | 'comparison'
  | 'low-confidence-avoidance'
  | 'financial-avoidance'
  | 'spending-guilt'
  | 'financial-insecurity';

export type DailyConversationConfidence = 'low' | 'medium' | 'high';

export type DailyConversationCandidate = {
  theme: DailyConversationTheme;
  pattern: DailyConversationPatternId;
  confidence: DailyConversationConfidence;
};

export type DailyConversationFocus = {
  theme: DailyConversationTheme;
  pattern: DailyConversationPatternId;
};

export type DailyConversationState = {
  phase: DailyConversationPhase;
  candidates: DailyConversationCandidate[];
  focus: DailyConversationFocus | null;
  turnCount: number;
  isComplete: boolean;
  finalThought: string | null;
};

export type DailyConversationPromptContext = {
  turnCount: number;
  phase: DailyConversationPhase;
  previousFocus: DailyConversationFocus | null;
  injectedGuide: DailyConversationFocus | null;
};

export type DailyConversationMessageDebug = {
  assessment: DailyConversationState;
  promptContext: DailyConversationPromptContext | null;
};

export type DailyConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type GetDailyConversationOpeningResult = {
  message: string;
  state: DailyConversationState;
};

export type SendDailyConversationMessageResult = {
  message: string;
  state: DailyConversationState;
  debug: {
    promptContext: DailyConversationPromptContext;
  } | null;
};

const OPENING_RETRY = 'Couldn’t start today’s conversation. Please try again.';
const SEND_RETRY = 'Couldn’t send that message. Please try again.';

export function createInitialDailyConversationState(): DailyConversationState {
  return {
    phase: 'open',
    candidates: [],
    focus: null,
    turnCount: 0,
    isComplete: false,
    finalThought: null,
  };
}

function readCode(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    return String((error as { code: unknown }).code);
  }
  return '';
}

export function toUserFacingDailyConversationError(
  error: unknown,
  kind: 'opening' | 'send',
): string {
  if (isNetworkError(error)) {
    return USER_FACING.offline;
  }
  const code = readCode(error);
  const raw =
    error instanceof Error
      ? error.message
      : typeof error === 'object' && error && 'message' in error
        ? String((error as { message: unknown }).message)
        : '';
  if (code === 'functions/unauthenticated') {
    return 'You need to be signed in to continue.';
  }
  if (
    kind === 'send' &&
    (code === 'functions/failed-precondition' ||
      raw.includes('already finished') ||
      raw.includes('maximum length') ||
      raw.includes('already reached'))
  ) {
    return 'This conversation has already finished.';
  }
  return kind === 'opening' ? OPENING_RETRY : SEND_RETRY;
}

function asState(value: unknown): DailyConversationState | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as DailyConversationState;
  if (typeof record.turnCount !== 'number' || typeof record.isComplete !== 'boolean') {
    return null;
  }
  if (typeof record.phase !== 'string') {
    return null;
  }
  if (!Array.isArray(record.candidates)) {
    return null;
  }
  return {
    phase: record.phase,
    candidates: record.candidates,
    focus: record.focus ?? null,
    turnCount: record.turnCount,
    isComplete: record.isComplete,
    finalThought:
      typeof record.finalThought === 'string' ? record.finalThought : null,
  };
}

function asFocus(value: unknown): DailyConversationFocus | null {
  if (value == null || typeof value !== 'object') {
    return null;
  }
  const record = value as { theme?: unknown; pattern?: unknown };
  if (typeof record.theme !== 'string' || typeof record.pattern !== 'string') {
    return null;
  }
  return {
    theme: record.theme as DailyConversationTheme,
    pattern: record.pattern as DailyConversationPatternId,
  };
}

function asPromptContext(value: unknown): DailyConversationPromptContext | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as {
    turnCount?: unknown;
    phase?: unknown;
    previousFocus?: unknown;
    injectedGuide?: unknown;
  };
  if (typeof record.turnCount !== 'number' || typeof record.phase !== 'string') {
    return null;
  }
  return {
    turnCount: record.turnCount,
    phase: record.phase as DailyConversationPhase,
    previousFocus: asFocus(record.previousFocus),
    injectedGuide: asFocus(record.injectedGuide),
  };
}

export async function getDailyConversationOpening(): Promise<GetDailyConversationOpeningResult> {
  const callable = httpsCallable<
    Record<string, never>,
    { message?: unknown; state?: unknown }
  >(getFirebaseFunctions(), 'getDailyConversationOpening');

  try {
    const result = await callable({});
    const message =
      typeof result.data.message === 'string' ? result.data.message.trim() : '';
    const state = asState(result.data.state);
    if (!message || !state) {
      throw new Error('getDailyConversationOpening returned an incomplete response.');
    }
    return { message, state };
  } catch (caught) {
    logTechnicalError('firebase.getDailyConversationOpening', caught);
    throw caught;
  }
}

export async function sendDailyConversationMessage(input: {
  messages: DailyConversationMessage[];
  state: DailyConversationState;
}): Promise<SendDailyConversationMessageResult> {
  const callable = httpsCallable<
    { messages: DailyConversationMessage[]; state: DailyConversationState },
    { message?: unknown; state?: unknown; debug?: unknown }
  >(getFirebaseFunctions(), 'sendDailyConversationMessage');

  try {
    const result = await callable({
      messages: input.messages,
      state: input.state,
    });
    const message =
      typeof result.data.message === 'string' ? result.data.message.trim() : '';
    const state = asState(result.data.state);
    if (!message || !state) {
      throw new Error('sendDailyConversationMessage returned an incomplete response.');
    }
    const debugRecord =
      result.data.debug && typeof result.data.debug === 'object'
        ? (result.data.debug as { promptContext?: unknown })
        : null;
    const promptContext = asPromptContext(debugRecord?.promptContext);
    return {
      message,
      state,
      debug: promptContext ? { promptContext } : null,
    };
  } catch (caught) {
    logTechnicalError('firebase.sendDailyConversationMessage', caught);
    throw caught;
  }
}
