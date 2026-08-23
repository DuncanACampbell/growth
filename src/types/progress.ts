import type { IsoDate } from '@/types/models';

export type ThemeProgressStatus = 'active' | 'completed';
export type ThemeSessionStatus = 'waiting' | 'completed';

/**
 * Progress for one purchased theme. Independent of other themes.
 * `currentDay` is the programme day of the outstanding session, or the
 * final day once the theme is completed.
 */
export type ThemeProgress = {
  themeId: string;
  purchasedAt: IsoDate;
  currentDay: number;
  status: ThemeProgressStatus;
  currentSessionStatus: ThemeSessionStatus;
  currentSessionAvailableAt: IsoDate;
  lastCompletedAt?: IsoDate;
};

/** Global "showed up today" streak — not per-theme. */
export type UserProgress = {
  currentStreak: number;
  lastActivityDate?: IsoDate;
};
