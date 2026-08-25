import { type ReactNode } from 'react';
import {
  Pressable,
  View,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { useTheme } from '@/theme';

export type AppButtonVariant = 'primary' | 'secondary';

const BUTTON_SIZE = 48;

export type AppButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children?: ReactNode;
  leadingIcon?: ReactNode;
  variant?: AppButtonVariant;
  fullWidth?: boolean;
  /** Equal width/height icon-only control matching the standard button height. */
  circular?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function AppButton({
  children,
  leadingIcon,
  variant = 'primary',
  fullWidth = false,
  circular = false,
  disabled = false,
  style,
  ...rest
}: AppButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';
  const labelColor = isPrimary
    ? theme.colors.buttonOnPrimary
    : theme.colors.buttonOnSecondary;
  const iconOnly =
    circular || (leadingIcon != null && (children == null || children === ''));

  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => {
        const backgroundColor = isPrimary
          ? theme.colors.buttonPrimary
          : theme.colors.buttonSecondary;
        const borderColor = isPrimary
          ? 'transparent'
          : theme.colors.buttonSecondaryBorder;

        return [
          {
            alignItems: 'center',
            alignSelf: fullWidth ? 'stretch' : circular ? 'center' : 'flex-start',
            backgroundColor,
            borderColor,
            borderRadius: theme.radii.full,
            borderWidth: isPrimary ? 0 : 1,
            height: circular ? BUTTON_SIZE : undefined,
            justifyContent: 'center',
            minHeight: BUTTON_SIZE,
            minWidth: iconOnly ? BUTTON_SIZE : undefined,
            opacity: disabled ? 0.4 : pressed ? 0.82 : 1,
            paddingHorizontal: circular
              ? 0
              : iconOnly
                ? theme.spacing.md
                : theme.spacing.xl,
            paddingVertical: circular ? 0 : theme.spacing.md,
            width: fullWidth ? '100%' : circular ? BUTTON_SIZE : undefined,
          },
          style,
        ];
      }}
      {...rest}
    >
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          gap: theme.spacing.sm,
          justifyContent: 'center',
        }}
      >
        {leadingIcon}
        {children == null || children === '' ? null : (
          <AppText
            variant="body"
            style={{
              color: labelColor,
              fontWeight: '600',
              textAlign: 'center',
            }}
          >
            {children}
          </AppText>
        )}
      </View>
    </Pressable>
  );
}
