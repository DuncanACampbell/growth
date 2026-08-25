import { Text, type TextProps, type TextStyle } from 'react-native';

import { useTheme } from '@/theme';
import { resolveAppTextStyle } from '@/theme/fonts';
import type { Typography } from '@/theme/tokens';

type AppTextVariant = keyof Typography;
type AppTextTone = 'default' | 'muted' | 'primary' | 'danger' | 'onPrimary';

export type AppTextProps = TextProps & {
  variant?: AppTextVariant;
  tone?: AppTextTone;
};

const toneToColor = {
  default: 'text',
  muted: 'textMuted',
  primary: 'primary',
  danger: 'danger',
  onPrimary: 'onPrimary',
} as const;

export function AppText({
  variant = 'body',
  tone = 'default',
  style,
  ...rest
}: AppTextProps) {
  const theme = useTheme();
  const typographyStyle = theme.typography[variant] as TextStyle;

  return (
    <Text
      style={resolveAppTextStyle([
        typographyStyle,
        { color: theme.colors[toneToColor[tone]] },
        style as TextStyle,
      ])}
      {...rest}
    />
  );
}
