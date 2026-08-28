import type { DailyConversationTheme } from './types';

/**
 * Daily Conversation memory is intentionally separate from guided programme
 * memory because this is an experimental independent mechanic.
 */
export type DailyConversationOutcomeType = 'insight' | 'experiment' | 'action';

export type DailyConversationMemory = {
  topic: string;
  theme: DailyConversationTheme | null;
  pattern: string | null;
  situation: string;
  insight: string;
  outcomeType: DailyConversationOutcomeType | null;
  outcome: string | null;
  followUp: string | null;
  finalThought: string;
  completedAt: string;
};
