import { type ReactNode, useState } from 'react';
import {
  Platform,
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
  onFocus,
  onBlur,
  ...rest
}: AppButtonProps) {
  const theme = useTheme();
  const [keyboardFocused, setKeyboardFocused] = useState(false);
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
      onFocus={(event) => {
        setKeyboardFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setKeyboardFocused(false);
        onBlur?.(event);
      }}
      style={({ pressed }) => {
        const backgroundColor = isPrimary
          ? theme.colors.buttonPrimary
          : theme.colors.buttonSecondary;
        const borderColor = isPrimary
          ? 'transparent'
          : theme.colors.buttonSecondaryBorder;
        const showWebFocus = Platform.OS === 'web' && keyboardFocused && !disabled;

        return [
          {
            alignItems: 'center',
            alignSelf: fullWidth ? 'stretch' : circular ? 'center' : 'flex-start',
            backgroundColor,
            borderColor: showWebFocus ? theme.colors.primary : borderColor,
            borderRadius: theme.radii.full,
            borderWidth: showWebFocus ? 1.5 : isPrimary ? 0 : 1,
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
            ...(Platform.OS === 'web'
              ? ({
                  cursor: disabled ? 'default' : 'pointer',
                  outlineStyle: 'none',
                  outlineWidth: 0,
                  outlineColor: 'transparent',
                } as unknown as ViewStyle)
              : null),
          },
          style,
          Platform.OS === 'web'
            ? ({
                outlineStyle: 'none',
                outlineWidth: 0,
              } as unknown as ViewStyle)
            : null,
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
