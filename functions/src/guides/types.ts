/** Conceptual conversation phases. Internal to the backend/model — not shown in the UI. */
export type ConversationPhase =
  | 'opening'
  | 'understanding'
  | 'support'
  | 'reframing'
  | 'reinforcement'
  | 'anchor'
  | 'complete';

export const CONVERSATION_PHASES: ConversationPhase[] = [
  'opening',
  'understanding',
  'support',
  'reframing',
  'reinforcement',
  'anchor',
  'complete',
];

export type ThemeGuide = {
  id: string;
  title: string;
  guide: string;
};

export type DailyExercise = {
  id: string;
  themeId: string;
  title: string;
  objective: string;
  openingPrompt: string;
  whatToUnderstand: string;
  reframeGoal: string;
  desiredInsight: string;
  anchorGuidance: string;
  notes?: string;
};
