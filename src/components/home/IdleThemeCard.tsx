import { Pressable } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import type { CatalogThemeVisual } from '@/data/theme-visuals';
import { useTheme } from '@/theme';

type IdleThemeCardProps = {
  themeName: string;
  message: string;
  visual: CatalogThemeVisual;
  onOpenTheme: () => void;
};

export function IdleThemeCard({
  themeName,
  message,
  visual,
  onOpenTheme,
}: IdleThemeCardProps) {
  const theme = useTheme();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${themeName}, ${message}`}
      onPress={onOpenTheme}
      style={{
        backgroundColor: visual.tint,
        borderRadius: theme.radii.xxl,
        gap: theme.spacing.sm,
        minHeight: 72,
        opacity: 0.72,
        padding: theme.spacing.xl,
      }}
    >
      <AppText
        variant="caption"
        style={{ color: visual.accent, fontWeight: '600' }}
        numberOfLines={2}
      >
        {themeName}
      </AppText>
      <AppText variant="body" style={{ color: visual.onTint }}>
        {message}
      </AppText>
    </Pressable>
  );
}
