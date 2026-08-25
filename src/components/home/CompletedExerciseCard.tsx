import { Pressable, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { CatalogThemeVisual } from '@/data/theme-visuals';
import { useTheme } from '@/theme';

type CompletedExerciseCardProps = {
  themeName: string;
  statement?: string | null;
  visual: CatalogThemeVisual;
  onOpenTheme: () => void;
};

export function CompletedExerciseCard({
  themeName,
  statement,
  visual,
  onOpenTheme,
}: CompletedExerciseCardProps) {
  const theme = useTheme();

  return (
    <View
      style={{
        backgroundColor: visual.tint,
        borderRadius: theme.radii.xxl,
        gap: theme.spacing.md,
        opacity: 0.92,
        padding: theme.spacing.xl,
      }}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${themeName}, open theme`}
        hitSlop={8}
        onPress={onOpenTheme}
        style={{ minHeight: 44, justifyContent: 'center' }}
      >
        <AppText
          variant="caption"
          style={{ color: visual.accent, fontWeight: '600' }}
          numberOfLines={2}
        >
          {themeName}
        </AppText>
      </Pressable>
      <AppText variant="body" style={{ color: visual.onTint }}>
        ✓ Done for today
      </AppText>
      {statement ? (
        <View style={{ gap: theme.spacing.xs }}>
          <AppText
            variant="label"
            style={{ color: visual.onTint, letterSpacing: 0.6, opacity: 0.7 }}
          >
            TODAY’S STATEMENT
          </AppText>
          <AppText variant="subtitle" style={{ color: visual.onTint }}>
            “{statement}”
          </AppText>
        </View>
      ) : null}
    </View>
  );
}
