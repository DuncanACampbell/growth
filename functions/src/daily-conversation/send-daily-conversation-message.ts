import { HttpsError, onCall } from 'firebase-functions/v2/https';

import { logCallableFailure, rethrowCallableError } from '../callable-error';
import { getDailyConversationInjectedGuideFocus } from './assemble';
import { resolveDailyConversationCompletion } from './completion';
import {
  dailyConversationOpenaiApiKey,
  generateDailyConversationTurn,
} from './generate';
import { isValidDailyConversationPatternForTheme } from './patterns';
import {
  countDailyConversationUserMessages,
  DAILY_CONVERSATION_MAX_USER_MESSAGES,
  getSuggestedDailyConversationPhase,
} from './session';
import type {
  DailyConversationCandidate,
  DailyConversationConfidence,
  DailyConversationFocus,
  DailyConversationMessage,
  DailyConversationPatternId,
  DailyConversationPhase,
  DailyConversationState,
  DailyConversationTheme,
  SendDailyConversationMessageResponse,
} from './types';
import {
  DAILY_CONVERSATION_CONFIDENCES,
  DAILY_CONVERSATION_PATTERN_IDS,
  DAILY_CONVERSATION_PHASES,
  DAILY_CONVERSATION_THEMES,
} from './types';

const GUIDE_UNAVAILABLE = 'The conversation could not continue. Please try again.';

const PHASES = new Set<string>(DAILY_CONVERSATION_PHASES);
const THEMES = new Set<string>(DAILY_CONVERSATION_THEMES);
const CONFIDENCES = new Set<string>(DAILY_CONVERSATION_CONFIDENCES);
const PATTERN_IDS = new Set<string>(DAILY_CONVERSATION_PATTERN_IDS);

function isPhase(value: unknown): value is DailyConversationPhase {
  return typeof value === 'string' && PHASES.has(value);
}

function isTheme(value: unknown): value is DailyConversationTheme {
  return typeof value === 'string' && THEMES.has(value);
}

function isConfidence(value: unknown): value is DailyConversationConfidence {
  return typeof value === 'string' && CONFIDENCES.has(value);
}

function isPatternId(value: unknown): value is DailyConversationPatternId {
  return typeof value === 'string' && PATTERN_IDS.has(value);
}

function parseFocus(value: unknown): DailyConversationFocus | null {
  if (value === null) {
    return null;
  }
  if (!value || typeof value !== 'object') {
    throw new HttpsError('invalid-argument', 'state.focus is invalid.');
  }
  const record = value as { theme?: unknown; pattern?: unknown };
  if (!isTheme(record.theme) || !isPatternId(record.pattern)) {
    throw new HttpsError('invalid-argument', 'state.focus is invalid.');
  }
  if (!isValidDailyConversationPatternForTheme(record.theme, record.pattern)) {
    throw new HttpsError('invalid-argument', 'state.focus is invalid.');
  }
  return { theme: record.theme, pattern: record.pattern };
}

function parseCandidate(value: unknown): DailyConversationCandidate {
  if (!value || typeof value !== 'object') {
    throw new HttpsError('invalid-argument', 'state.candidates is invalid.');
  }
  const record = value as {
    theme?: unknown;
    pattern?: unknown;
    confidence?: unknown;
  };
  const pattern = record.pattern;
  if (!isTheme(record.theme) || !isPatternId(pattern) || !isConfidence(record.confidence)) {
    throw new HttpsError('invalid-argument', 'state.candidates is invalid.');
  }
  if (!isValidDailyConversationPatternForTheme(record.theme, pattern)) {
    throw new HttpsError('invalid-argument', 'state.candidates is invalid.');
  }
  return {
    theme: record.theme,
    pattern,
    confidence: record.confidence,
  };
}

function parseState(value: unknown): DailyConversationState {
  if (value == null) {
    throw new HttpsError('invalid-argument', 'state is required.');
  }
  if (typeof value !== 'object') {
    throw new HttpsError('invalid-argument', 'state is required.');
  }
  const record = value as Record<string, unknown>;
  if (!isPhase(record.phase)) {
    throw new HttpsError('invalid-argument', 'state.phase is invalid.');
  }
  if (!Array.isArray(record.candidates)) {
    throw new HttpsError('invalid-argument', 'state.candidates is invalid.');
  }
  if (typeof record.turnCount !== 'number' || !Number.isFinite(record.turnCount)) {
    throw new HttpsError('invalid-argument', 'state.turnCount is invalid.');
  }
  if (typeof record.isComplete !== 'boolean') {
    throw new HttpsError('invalid-argument', 'state.isComplete is invalid.');
  }
  if (record.finalThought !== null && typeof record.finalThought !== 'string') {
    throw new HttpsError('invalid-argument', 'state.finalThought is invalid.');
  }
  return {
    phase: record.phase,
    candidates: record.candidates.map(parseCandidate),
    focus: parseFocus(record.focus),
    turnCount: record.turnCount,
    isComplete: record.isComplete,
    finalThought:
      typeof record.finalThought === 'string' ? record.finalThought : null,
  };
}

function parseMessages(value: unknown): DailyConversationMessage[] {
  if (!Array.isArray(value)) {
    throw new HttpsError('invalid-argument', 'messages is required.');
  }
  const messages: DailyConversationMessage[] = [];
  for (const item of value) {
    if (!item || typeof item !== 'object') {
      throw new HttpsError('invalid-argument', 'messages is invalid.');
    }
    const record = item as { role?: unknown; content?: unknown };
    if (record.role !== 'user' && record.role !== 'assistant') {
      throw new HttpsError('invalid-argument', 'messages is invalid.');
    }
    if (typeof record.content !== 'string') {
      throw new HttpsError('invalid-argument', 'messages is invalid.');
    }
    messages.push({ role: record.role, content: record.content.trim() });
  }
  return messages;
}

/** Experimental Daily Conversation turn. Isolated from guided-exercise send logic. */
export const sendDailyConversationMessage = onCall(
  {
    region: 'us-central1',
    secrets: [dailyConversationOpenaiApiKey],
  },
  async (request): Promise<SendDailyConversationMessageResponse> => {
    // Cloud Run permits invocation so Firebase callable requests can reach this
    // handler. User authorization is enforced here using Firebase Auth.
    if (!request.auth) {
      throw new HttpsError(
        'unauthenticated',
        'You must be signed in to use Growth.',
      );
    }

    const data = request.data as { messages?: unknown; state?: unknown };
    const messages = parseMessages(data.messages);
    const incomingState = parseState(data.state);

    if (incomingState.isComplete) {
      throw new HttpsError(
        'failed-precondition',
        'This conversation has already finished.',
      );
    }

    const latest = messages[messages.length - 1];
    if (!latest || latest.role !== 'user') {
      throw new HttpsError(
        'invalid-argument',
        'The latest message must be from the user.',
      );
    }
    if (!latest.content) {
      throw new HttpsError('invalid-argument', 'Message content is empty.');
    }

    const turnCount = countDailyConversationUserMessages(messages);
    if (turnCount > DAILY_CONVERSATION_MAX_USER_MESSAGES) {
      throw new HttpsError(
        'failed-precondition',
        'This conversation has already finished.',
      );
    }

    const suggestedPhase = getSuggestedDailyConversationPhase(turnCount);
    const previousFocus = incomingState.focus
      ? {
          theme: incomingState.focus.theme,
          pattern: incomingState.focus.pattern,
        }
      : null;
    const promptContext = {
      turnCount,
      phase: suggestedPhase,
      previousFocus,
      injectedGuide: getDailyConversationInjectedGuideFocus(previousFocus),
    };

    try {
      const turn = await generateDailyConversationTurn({
        messages,
        turnCount,
        suggestedPhase,
        incomingFocus: incomingState.focus,
      });
      const completion = resolveDailyConversationCompletion({
        turnCount,
        shouldComplete: turn.shouldComplete,
        finalThought: turn.finalThought,
        closingMessage: turn.message,
      });
      return {
        message: turn.message,
        state: {
          phase: completion.phase,
          candidates: turn.classification.candidates,
          focus: turn.classification.focus,
          turnCount,
          isComplete: completion.isComplete,
          finalThought: completion.finalThought,
        },
        debug: { promptContext },
      };
    } catch (caught) {
      if (caught instanceof HttpsError) {
        throw caught;
      }
      logCallableFailure('sendDailyConversationMessage', caught, {
        uid: request.auth.uid,
        turnCount,
      });
      rethrowCallableError(
        caught,
        GUIDE_UNAVAILABLE,
        'Daily Conversation model call failed',
      );
    }
  },
);
