import { CONVERSATION_PHASES } from './types';
import type { DailyExercise, ThemeGuide } from './types';

/** Combines the three prompt layers into one system instruction for the LLM. */
export function assembleSystemPrompt(input: {
  globalGuide: string;
  themeGuide: ThemeGuide;
  exercise: DailyExercise;
  pacing?: string;
  previousMemory?: string;
}): string {
  const { globalGuide, themeGuide, exercise, pacing, previousMemory } = input;
  const notes = exercise.notes?.trim()
    ? `\nNotes: ${exercise.notes.trim()}`
    : '';
  const pacingBlock = pacing?.trim()
    ? `\n\n## Session pacing (internal)\n${pacing.trim()}`
    : '';
  const memoryBlock = previousMemory?.trim()
    ? `\n\n${previousMemory.trim()}`
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
Anchor: ${exercise.anchorGuidance}${notes}${pacingBlock}${memoryBlock}

Internal phases (do not mention these names): ${CONVERSATION_PHASES.join(', ')}.
Stay in a phase when more understanding is needed. Do not treat this as a script.
When the day's insight has been reached, set isComplete to true, set phase to complete, provide finalStatement distilled from the user's own language, and fill memory (topic, pattern, reframe, memoryNote). Leave memory null until then. Do not keep asking questions just because turns remain.
`;
}
