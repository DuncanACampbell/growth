import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useColorScheme } from '@/hooks/use-color-scheme';

import { colors, radii, spacing, typography, type ColorScheme, type Theme } from './tokens';

const ThemeContext = createContext<Theme | null>(null);

function resolveScheme(scheme: string | null | undefined): ColorScheme {
  return scheme === 'dark' ? 'dark' : 'light';
}

export function ThemeProvider({
  children,
  scheme: schemeOverride,
}: {
  children: ReactNode;
  scheme?: ColorScheme;
}) {
  const systemScheme = useColorScheme();
  const theme = useMemo<Theme>(() => {
    const scheme = schemeOverride ?? resolveScheme(systemScheme);
    return {
      scheme,
      colors: colors[scheme],
      spacing,
      radii,
      typography,
    };
  }, [schemeOverride, systemScheme]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within ThemeProvider.');
  }
  return theme;
}
