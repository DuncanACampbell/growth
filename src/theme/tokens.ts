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
  full: 9999,
} as const;

export const typography = {
  title: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 26,
    fontWeight: '600',
  },
  body: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
  },
  caption: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '400',
  },
} as const;

/**
 * Semantic colours only. Swap these when the real brand palette arrives;
 * screens should never hard-code hex values.
 */
export const colors = {
  light: {
    background: '#F7F7F5',
    surface: '#FFFFFF',
    text: '#1A1A18',
    textMuted: '#6B6B66',
    border: '#E4E4DF',
    primary: '#1F6B4A',
    onPrimary: '#FFFFFF',
    danger: '#B42318',
  },
  dark: {
    background: '#121211',
    surface: '#1C1C1A',
    text: '#F5F5F0',
    textMuted: '#A3A39A',
    border: '#2E2E2A',
    primary: '#5FBF91',
    onPrimary: '#0C1F16',
    danger: '#F97066',
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
