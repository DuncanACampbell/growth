import { Pressable } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { CatalogThemeVisual } from '@/data/theme-visuals';
import { displayStatement } from '@/lib/display-statement';
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
  const takeaway = statement ? displayStatement(statement) : '';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${themeName}, open theme`}
      onPress={onOpenTheme}
      style={{
        backgroundColor: visual.tint,
        borderRadius: theme.radii.xxl,
        gap: theme.spacing.lg,
        opacity: 0.92,
        paddingHorizontal: theme.spacing.xl,
        paddingVertical: theme.spacing.xxl,
      }}
    >
      {takeaway ? (
        <AppText
          variant="subtitle"
          style={{
            color: visual.onTint,
            fontSize: 22,
            fontWeight: '600',
            lineHeight: 32,
            textAlign: 'center',
          }}
        >
          {takeaway}
        </AppText>
      ) : null}

      <AppText
        variant="caption"
        style={{
          color: theme.colors.textMuted,
          fontWeight: '500',
          textAlign: 'center',
        }}
      >
        {themeName} · Come back tomorrow
      </AppText>
    </Pressable>
  );
}
