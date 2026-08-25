import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme';

type StreakBadgeProps = {
  currentStreak: number;
};

export function StreakBadge({ currentStreak }: StreakBadgeProps) {
  const theme = useTheme();
  const label = `${currentStreak} 🔥 Streak`;

  return (
    <View
      accessibilityLabel={`${currentStreak} day streak`}
      style={{
        alignItems: 'center',
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.radii.full,
        flexDirection: 'row',
        gap: theme.spacing.xs,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
      }}
    >
      <AppText variant="caption" style={{ fontWeight: '600' }}>
        {label}
      </AppText>
    </View>
  );
}
