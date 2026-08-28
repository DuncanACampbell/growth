import type { DailyConversationPhase } from './types';
import {
  DAILY_CONVERSATION_MAX_USER_MESSAGES,
  getSuggestedDailyConversationPhase,
} from './session';

/** Natural completion is allowed from this user-message count onward. */
export const DAILY_CONVERSATION_MIN_NATURAL_COMPLETE = 5;

export const DAILY_CONVERSATION_FALLBACK_THOUGHT =
  'Today I can focus on one useful next step rather than solving everything at once.';

export function usableDailyConversationThought(
  value: unknown,
): string | null {
  if (typeof value !== 'string') {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length < 8) {
    return null;
  }
  return trimmed;
}

/** Last-resort thought when the model omitted one on a mandatory close. */
export function deriveDailyConversationThoughtFromMessage(
  message: string,
): string | null {
  const trimmed = message.trim();
  if (!trimmed) {
    return null;
  }
  const first = trimmed.split(/(?<=[.!])\s+/)[0] ?? trimmed;
  const sentence = first.replace(/["“”]/g, '').trim();
  if (
    !sentence ||
    sentence.includes('?') ||
    sentence.length < 12 ||
    sentence.length > 180
  ) {
    return null;
  }
  return sentence;
}

export function resolveDailyConversationCompletion(input: {
  turnCount: number;
  shouldComplete: boolean;
  finalThought: string | null;
  closingMessage: string;
}): {
  isComplete: boolean;
  finalThought: string | null;
  phase: DailyConversationPhase;
} {
  const suggestedPhase = getSuggestedDailyConversationPhase(input.turnCount);
  const modelThought = usableDailyConversationThought(input.finalThought);

  if (input.turnCount >= DAILY_CONVERSATION_MAX_USER_MESSAGES) {
    const thought =
      modelThought ??
      deriveDailyConversationThoughtFromMessage(input.closingMessage) ??
      DAILY_CONVERSATION_FALLBACK_THOUGHT;
    return {
      isComplete: true,
      finalThought: thought,
      phase: 'close',
    };
  }

  if (input.turnCount < DAILY_CONVERSATION_MIN_NATURAL_COMPLETE) {
    return {
      isComplete: false,
      finalThought: null,
      phase: suggestedPhase,
    };
  }

  if (input.shouldComplete && modelThought) {
    return {
      isComplete: true,
      finalThought: modelThought,
      phase: 'close',
    };
  }

  return {
    isComplete: false,
    finalThought: null,
    phase: suggestedPhase,
  };
}

export function dailyConversationCompletionHint(turnCount: number): string {
  if (turnCount >= DAILY_CONVERSATION_MAX_USER_MESSAGES) {
    return `This is the final turn (user message ${turnCount}). You MUST set shouldComplete to true, return a non-empty finalThought, and return compact memory fields. Do not ask a question. Put the Thought for Today only in finalThought, not in message.`;
  }
  if (turnCount === 8) {
    return 'User message 8: strongly prefer closing now unless there is an obvious reason the user still needs one more exchange. If you close, set shouldComplete true and return a non-empty finalThought plus compact memory.';
  }
  if (turnCount >= DAILY_CONVERSATION_MIN_NATURAL_COMPLETE) {
    return `User message ${turnCount}: you may complete if one useful insight, experiment, or action has been reached. Do not continue only to use remaining turns. If you complete, set shouldComplete true and return a non-empty finalThought plus compact memory.`;
  }
  return `User message ${turnCount}: do not complete yet. Set shouldComplete to false, finalThought to null, and memory to null. Keep understanding.`;
}
