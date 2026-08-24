import { SELF_ESTEEM_DAY_01, SELF_ESTEEM_DAY_01_ID } from './exercises/self-esteem-01';
import { GLOBAL_CONVERSATION_GUIDE } from './global-conversation-guide';
import {
  SELF_ESTEEM_THEME_GUIDE,
  SELF_ESTEEM_THEME_ID,
} from './themes/self-esteem';
import type { DailyExercise, ThemeGuide } from './types';

const THEME_GUIDES: Record<string, ThemeGuide> = {
  [SELF_ESTEEM_THEME_ID]: SELF_ESTEEM_THEME_GUIDE,
};

const DAILY_EXERCISES: Record<string, DailyExercise> = {
  [`${SELF_ESTEEM_THEME_ID}:${SELF_ESTEEM_DAY_01_ID}`]: SELF_ESTEEM_DAY_01,
};

export function getGlobalConversationGuide(): string {
  return GLOBAL_CONVERSATION_GUIDE;
}

export function getThemeGuide(themeId: string): ThemeGuide | null {
  return THEME_GUIDES[themeId] ?? null;
}

export function getDailyExercise(
  themeId: string,
  exerciseId: string,
): DailyExercise | null {
  return DAILY_EXERCISES[`${themeId}:${exerciseId}`] ?? null;
}
