import { SELF_ESTEEM_DAY_01 } from './exercises/self-esteem-01';
import { SELF_ESTEEM_DAY_02 } from './exercises/self-esteem-02';
import { SELF_ESTEEM_DAY_03 } from './exercises/self-esteem-03';
import { SELF_ESTEEM_DAY_04 } from './exercises/self-esteem-04';
import { SELF_ESTEEM_DAY_05 } from './exercises/self-esteem-05';
import { SELF_ESTEEM_DAY_06 } from './exercises/self-esteem-06';
import { SELF_ESTEEM_DAY_07 } from './exercises/self-esteem-07';
import { GLOBAL_CONVERSATION_GUIDE } from './global-conversation-guide';
import {
  SELF_ESTEEM_THEME_GUIDE,
  SELF_ESTEEM_THEME_ID,
} from './themes/self-esteem';
import type { DailyExercise, ThemeGuide } from './types';

const THEME_GUIDES: Record<string, ThemeGuide> = {
  [SELF_ESTEEM_THEME_ID]: SELF_ESTEEM_THEME_GUIDE,
};

const SELF_ESTEEM_DAYS: DailyExercise[] = [
  SELF_ESTEEM_DAY_01,
  SELF_ESTEEM_DAY_02,
  SELF_ESTEEM_DAY_03,
  SELF_ESTEEM_DAY_04,
  SELF_ESTEEM_DAY_05,
  SELF_ESTEEM_DAY_06,
  SELF_ESTEEM_DAY_07,
];

const DAILY_EXERCISES: Record<string, DailyExercise> = Object.fromEntries(
  SELF_ESTEEM_DAYS.map((exercise) => [`${exercise.themeId}:${exercise.id}`, exercise]),
);

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
