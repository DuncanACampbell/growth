import { Pressable } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { CatalogThemeVisual } from '@/data/theme-visuals';
import { useTheme } from '@/theme';

type CompletedExerciseCardProps = {
  themeName: string;
  statement?: string | null;
  visual: CatalogThemeVisual;
  onOpenTheme: () => void;
};

/** Strip wrapping quotes for display only; does not alter stored statement text. */
function displayStatement(statement: string): string {
  const trimmed = statement.trim();
  const pairs: [string, string][] = [
    ['"', '"'],
    ['\u201C', '\u201D'],
    ['\u2018', '\u2019'],
    ["'", "'"],
  ];
  for (const [open, close] of pairs) {
    if (
      trimmed.length >= 2 &&
      trimmed.startsWith(open) &&
      trimmed.endsWith(close)
    ) {
      return trimmed.slice(open.length, -close.length).trim();
    }
  }
  return trimmed;
}

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
