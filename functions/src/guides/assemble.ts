import { CONVERSATION_PHASES } from './types';
import type { DailyExercise, ThemeGuide } from './types';

/** Combines the three prompt layers into one system instruction for the LLM. */
export function assembleSystemPrompt(input: {
  globalGuide: string;
  themeGuide: ThemeGuide;
  exercise: DailyExercise;
}): string {
  const { globalGuide, themeGuide, exercise } = input;
  const notes = exercise.notes?.trim()
    ? `\nNotes: ${exercise.notes.trim()}`
    : '';

  return `${globalGuide.trim()}

## Theme: ${themeGuide.title}
${themeGuide.guide.trim()}

## Today's exercise
Id: ${exercise.id}
Title: ${exercise.title}
Objective: ${exercise.objective}
Opening already shown to the user as the first message — treat it as the start of this conversation: ${exercise.openingPrompt}
What to understand: ${exercise.whatToUnderstand}
Reframe goal: ${exercise.reframeGoal}
Desired insight: ${exercise.desiredInsight}
Anchor: ${exercise.anchorGuidance}${notes}

Internal phases (do not mention these names): ${CONVERSATION_PHASES.join(', ')}.
Stay in a phase when more understanding is needed. Do not treat this as a script or a message quota.
`;
}
