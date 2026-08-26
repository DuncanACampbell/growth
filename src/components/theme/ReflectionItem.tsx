import { View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { CatalogThemeVisual } from '@/data/theme-visuals';
import { formatCompactDate } from '@/lib/calendar';
import { displayStatement } from '@/lib/display-statement';
import { useTheme } from '@/theme';
import type { IsoDate } from '@/types/models';

export type ReflectionVariant = 'tinted' | 'open' | 'neutral';

type ReflectionItemProps = {
  statement: string;
  day: number;
  completedAt: IsoDate;
  visual: CatalogThemeVisual;
  variant: ReflectionVariant;
};

export function reflectionVariantForIndex(index: number): ReflectionVariant {
  const cycle: ReflectionVariant[] = ['tinted', 'open', 'neutral'];
  return cycle[index % cycle.length] ?? 'open';
}

export function ReflectionItem({
  statement,
  day,
  completedAt,
  visual,
  variant,
}: ReflectionItemProps) {
  const theme = useTheme();
  const takeaway = displayStatement(statement);

  if (!takeaway) {
    return null;
  }

  const padded = variant !== 'open';
  const backgroundColor =
    variant === 'tinted'
      ? visual.tint
      : variant === 'neutral'
        ? theme.colors.surface
        : 'transparent';

  return (
    <View
      style={{
        backgroundColor,
        borderRadius: padded ? theme.radii.xxl : 0,
        gap: theme.spacing.md,
        paddingHorizontal: padded ? theme.spacing.xl : theme.spacing.xs,
        paddingVertical: padded ? theme.spacing.xl : theme.spacing.lg,
      }}
    >
      <AppText
        variant="subtitle"
        style={{
          color: visual.onTint,
          fontSize: 20,
          fontWeight: '600',
          lineHeight: 30,
        }}
      >
        {takeaway}
      </AppText>
      <AppText
        variant="caption"
        style={{
          color: theme.colors.textMuted,
          fontWeight: '500',
        }}
      >
        Day {day} · {formatCompactDate(completedAt)}
      </AppText>
    </View>
  );
}
