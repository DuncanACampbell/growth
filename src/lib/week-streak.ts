import { addCalendarDays, compareIsoDates, isSameIsoDate } from '@/lib/calendar';
import type { IsoDate } from '@/types/models';

const WEEKDAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'] as const;

export type WeekStripDay = {
  date: IsoDate;
  label: (typeof WEEKDAY_LABELS)[number];
  kind: 'completed' | 'current' | 'future' | 'missed';
  filled: boolean;
};

function mondayFirstIndex(iso: IsoDate): number {
  const [year, month, day] = iso.split('-').map(Number);
  const weekday = new Date(year ?? 0, (month ?? 1) - 1, day ?? 1).getDay();
  return weekday === 0 ? 6 : weekday - 1;
}

function mondayOfWeek(today: IsoDate): IsoDate {
  return addCalendarDays(today, -mondayFirstIndex(today));
}

/**
 * Approximate Mon–Sun strip from account streak plus any dated activity.
 * Does not change how streaks are calculated.
 */
export function getWeekStripDays(input: {
  today: IsoDate;
  currentStreak: number;
  lastActivityDate?: IsoDate;
  activityDates: Iterable<IsoDate>;
}): WeekStripDay[] {
  const completedDates = new Set(input.activityDates);
  const streakLength = Math.max(0, Math.round(input.currentStreak));
  const streakEnd =
    input.lastActivityDate ??
    (streakLength > 0 ? addCalendarDays(input.today, -1) : undefined);

  if (streakEnd && streakLength > 0) {
    for (let offset = 0; offset < streakLength; offset += 1) {
      completedDates.add(addCalendarDays(streakEnd, -offset));
    }
  }

  const monday = mondayOfWeek(input.today);
  return WEEKDAY_LABELS.map((label, index) => {
    const date = addCalendarDays(monday, index);
    if (compareIsoDates(date, input.today) > 0) {
      return { date, label, kind: 'future' as const, filled: false };
    }
    const filled = completedDates.has(date);
    if (isSameIsoDate(date, input.today)) {
      return { date, label, kind: 'current' as const, filled };
    }
    return {
      date,
      label,
      kind: filled ? ('completed' as const) : ('missed' as const),
      filled,
    };
  });
}
