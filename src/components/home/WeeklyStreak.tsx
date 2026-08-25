import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { WeekStripDay } from '@/lib/week-streak';
import { useTheme } from '@/theme';

type WeeklyStreakProps = {
  days: WeekStripDay[];
  currentStreak: number;
};

export function WeeklyStreak({ days, currentStreak }: WeeklyStreakProps) {
  const theme = useTheme();
  const streakLabel =
    currentStreak === 1 ? '1 day streak' : `${currentStreak} day streak`;

  return (
    <View style={{ gap: theme.spacing.md }}>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          justifyContent: 'space-between',
        }}
      >
        {days.map((day) => {
          const isCurrent = day.kind === 'current';
          const fill = day.filled ? theme.colors.primary : 'transparent';
          const ring = isCurrent
            ? theme.colors.primary
            : day.kind === 'missed'
              ? theme.colors.border
              : day.kind === 'future'
                ? theme.colors.border
                : theme.colors.primary;
          const labelColor = day.filled
            ? theme.colors.onPrimary
            : theme.colors.textMuted;

          return (
            <View
              key={day.date}
              accessibilityLabel={`${day.label}, ${day.kind}${day.filled ? ', completed' : ''}`}
              style={{ alignItems: 'center', gap: theme.spacing.xs, minWidth: 36 }}
            >
              <View
                style={{
                  alignItems: 'center',
                  backgroundColor: fill,
                  borderColor: ring,
                  borderRadius: theme.radii.full,
                  borderWidth: isCurrent ? 2 : 1,
                  height: 36,
                  justifyContent: 'center',
                  width: 36,
                }}
              >
                <AppText
                  variant="label"
                  style={{ color: labelColor, letterSpacing: 0.4 }}
                >
                  {day.label}
                </AppText>
              </View>
            </View>
          );
        })}
      </View>
      <AppText variant="body">{streakLabel}</AppText>
    </View>
  );
}
