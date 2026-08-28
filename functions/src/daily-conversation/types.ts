import type { DailyConversationMemory } from './memory';

/** Experimental Daily Conversation mechanic. Isolated from guided-theme exercises. */

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

export type DailyConversationPatternSummary = {
  id: DailyConversationPatternId;
  theme: DailyConversationTheme;
  name: string;
  summary: string;
  signals: string[];
};

export type DailyConversationPatternGuide = {
  id: DailyConversationPatternId;
  coreDynamic: string;
  explore: string[];
  approaches: string[];
  avoid: string[];
};

/**
 * In-memory session for one Daily Conversation.
 * candidates may be [] and focus may be null — a conversation need not map to a theme.
 */
export type DailyConversationState = {
  phase: DailyConversationPhase;
  candidates: DailyConversationCandidate[];
  focus: DailyConversationFocus | null;
  turnCount: number;
  isComplete: boolean;
  finalThought: string | null;
};

export type DailyConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type GetDailyConversationOpeningRequest = {
  localDate: string;
};

export type GetDailyConversationOpeningResponse = {
  message: string;
  state: DailyConversationState;
  previousMemory: DailyConversationMemory | null;
};

export type SendDailyConversationMessageRequest = {
  messages: DailyConversationMessage[];
  state: DailyConversationState;
  localDate: string;
  previousMemory?: DailyConversationMemory | null;
  wrapUp?: boolean;
};

export type DailyConversationClassification = {
  candidates: DailyConversationCandidate[];
  focus: DailyConversationFocus | null;
};

/** Compact debug snapshot of what was used to generate a turn. Not the full prompt. */
export type DailyConversationPromptContext = {
  turnCount: number;
  phase: DailyConversationPhase;
  previousFocus: DailyConversationFocus | null;
  injectedGuide: DailyConversationFocus | null;
  previousConversation: {
    topic: string;
    insight: string;
  } | null;
};

export type DailyConversationTurnDebug = {
  promptContext: DailyConversationPromptContext;
};

export type SendDailyConversationMessageResponse = {
  message: string;
  state: DailyConversationState;
  debug?: DailyConversationTurnDebug;
};

export const DAILY_CONVERSATION_PHASES: DailyConversationPhase[] = [
  'open',
  'understand',
  'focus',
  'help',
  'close',
];

export const DAILY_CONVERSATION_THEMES: DailyConversationTheme[] = [
  'self-esteem',
  'money',
];

export const DAILY_CONVERSATION_CONFIDENCES: DailyConversationConfidence[] = [
  'low',
  'medium',
  'high',
];

export const DAILY_CONVERSATION_PATTERN_IDS: DailyConversationPatternId[] = [
  'harsh-self-criticism',
  'comparison',
  'low-confidence-avoidance',
  'financial-avoidance',
  'spending-guilt',
  'financial-insecurity',
];
