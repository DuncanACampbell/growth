import type {
  DailyConversationMessage,
  DailyConversationPhase,
  DailyConversationState,
} from './types';

/** Hard cap on user messages in one Daily Conversation. Isolated from guided-exercise session limits. */
export const DAILY_CONVERSATION_MAX_USER_MESSAGES = 9;

/** Initial in-memory state for a Daily Conversation session. Isolated from guided-exercise session logic. */
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

/** Returns a new state with turnCount + 1. Does not mutate the input. */
export function incrementDailyConversationTurn(
  state: DailyConversationState,
): DailyConversationState {
  return {
    ...state,
    candidates: state.candidates.slice(),
    focus: state.focus ? { ...state.focus } : null,
    turnCount: state.turnCount + 1,
  };
}

/** True when the conversation has reached 9 user messages. Does not complete the session. */
export function isDailyConversationAtHardLimit(
  state: DailyConversationState,
): boolean {
  return state.turnCount >= DAILY_CONVERSATION_MAX_USER_MESSAGES;
}

/**
 * Advisory phase from user-message count.
 * The phase is advisory only. Future LLM logic may remain in or return to an
 * earlier phase if the user reveals important new information.
 */
export function getSuggestedDailyConversationPhase(
  turnCount: number,
): DailyConversationPhase {
  if (turnCount <= 0) {
    return 'open';
  }
  if (turnCount <= 2) {
    return 'understand';
  }
  if (turnCount <= 4) {
    return 'focus';
  }
  if (turnCount <= 7) {
    return 'help';
  }
  return 'close';
}

export function countDailyConversationUserMessages(
  messages: DailyConversationMessage[],
): number {
  return messages.filter((message) => message.role === 'user').length;
}
