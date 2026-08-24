/**
 * AI instructions for one day of a programme.
 * These fields describe what a future LLM should accomplish, not UI copy.
 * `opening` may be used as the first question because there is no prior context.
 */
export type DailySession = {
  id: string;
  day: number;
  concept: string;
  objective: string;
  opening?: string;
  explorationGoal: string;
  beliefGoal: string;
  reframeGoal: string;
  applicationGoal: string;
  anchorGoal: string;
};

export type Programme = {
  id: string;
  themeId: string;
  title: string;
  durationDays: number;
  sessions: DailySession[];
};
