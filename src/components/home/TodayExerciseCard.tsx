import { Pressable, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import type { CatalogThemeVisual } from '@/data/theme-visuals';
import { useTheme } from '@/theme';

type TodayExerciseCardProps = {
  themeName: string;
  day: number;
  totalDays: number;
  title: string;
  subtitle?: string;
  actionLabel: string;
  visual: CatalogThemeVisual;
  onOpenTheme: () => void;
  onStart: () => void;
};

export function TodayExerciseCard({
  themeName,
  day,
  totalDays,
  title,
  subtitle,
  actionLabel,
  visual,
  onOpenTheme,
  onStart,
}: TodayExerciseCardProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: visual.tint,
        borderRadius: theme.radii.xxl,
        gap: theme.spacing.md,
        padding: theme.spacing.xl,
      }}
    >
      <View
        style={{
          alignItems: 'flex-start',
          flexDirection: 'row',
          justifyContent: 'space-between',
          gap: theme.spacing.md,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`${themeName}, open theme`}
          hitSlop={8}
          onPress={onOpenTheme}
          style={{ flex: 1, minHeight: 44, justifyContent: 'center' }}
        >
          <AppText
            variant="caption"
            style={{ color: visual.accent, fontWeight: '600' }}
            numberOfLines={2}
          >
            {themeName}
          </AppText>
        </Pressable>
        <AppText
          variant="label"
          style={{
            color: visual.onTint,
            letterSpacing: 0.8,
            opacity: 0.7,
            paddingTop: 2,
          }}
        >
          DAY {day} OF {totalDays}
        </AppText>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${actionLabel} ${title}`}
        onPress={onStart}
      >
        <AppText
          variant="subtitle"
          style={{ color: visual.onTint, fontSize: 24, lineHeight: 30 }}
        >
          {title}
        </AppText>
        {subtitle ? (
          <AppText
            variant="body"
            style={{ color: visual.onTint, marginTop: theme.spacing.sm, opacity: 0.8 }}
          >
            {subtitle}
          </AppText>
        ) : null}
      </Pressable>

      <AppButton
        fullWidth
        onPress={onStart}
        accessibilityLabel={actionLabel}
        style={{ marginTop: theme.spacing.sm }}
      >
        {actionLabel}
      </AppButton>
    </View>
  );
}
