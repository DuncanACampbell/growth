export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radii = {
  none: 0,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 28,
  full: 9999,
} as const;

export const typography = {
  greeting: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '600',
  },
  title: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
  },
  subtitle: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  body: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  caption: {
    fontFamily: 'PlusJakartaSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
  label: {
    fontFamily: 'PlusJakartaSans_600SemiBold',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600',
  },
} as const;

/**
 * Semantic colours only. Swap these when the real brand palette arrives;
 * screens should never hard-code hex values.
 */
export const colors = {
  light: {
    background: '#F6EFE6',
    surface: '#FFF9F3',
    text: '#1A1A18',
    textMuted: '#6B6B66',
    border: '#E4E4DF',
    primary: '#1F6B4A',
    onPrimary: '#FFFFFF',
    danger: '#B42318',
    buttonPrimary: '#1C1916',
    buttonOnPrimary: '#FFF9F3',
    buttonSecondary: '#FFFFFF',
    buttonOnSecondary: '#1A1A18',
    buttonSecondaryBorder: '#E4E4DF',
  },
  dark: {
    background: '#161310',
    surface: '#221E1A',
    text: '#F5F5F0',
    textMuted: '#A3A39A',
    border: '#2E2E2A',
    primary: '#5FBF91',
    onPrimary: '#0C1F16',
    danger: '#F97066',
    buttonPrimary: '#F5F5F0',
    buttonOnPrimary: '#161310',
    buttonSecondary: '#2A2622',
    buttonOnSecondary: '#F5F5F0',
    buttonSecondaryBorder: '#3A3530',
  },
} as const;

export type ColorScheme = keyof typeof colors;
export type ThemeColors = (typeof colors)[ColorScheme];
export type Spacing = typeof spacing;
export type Radii = typeof radii;
export type Typography = typeof typography;

export type Theme = {
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: Spacing;
  radii: Radii;
  typography: Typography;
};
