import type { ColorScheme } from '@/theme/tokens';

/** Visual identity for a catalogue theme — not the UI ThemeProvider. */
export type CatalogThemeVisual = {
  accent: string;
  tint: string;
  onAccent: string;
  onTint: string;
};

const NAMED_LIGHT: Record<string, CatalogThemeVisual> = {
  'self-esteem': {
    accent: '#C45E52',
    tint: '#F4DED8',
    onAccent: '#FFFFFF',
    onTint: '#3B211C',
  },
  'theme-money': {
    accent: '#2E7A5C',
    tint: '#DCECE4',
    onAccent: '#FFFFFF',
    onTint: '#143028',
  },
};

const NAMED_DARK: Record<string, CatalogThemeVisual> = {
  'self-esteem': {
    accent: '#E08B80',
    tint: '#3A2A27',
    onAccent: '#1A100E',
    onTint: '#F3E6E2',
  },
  'theme-money': {
    accent: '#6FBF9A',
    tint: '#1E332B',
    onAccent: '#0C1F16',
    onTint: '#E4F1EA',
  },
};

const DEFAULT_VISUAL: CatalogThemeVisual = {
  accent: '#B56A3A',
  tint: '#F3E2D4',
  onAccent: '#FFFFFF',
  onTint: '#3A2416',
};

const FALLBACK_LIGHT: CatalogThemeVisual[] = [
  DEFAULT_VISUAL,
  { accent: '#5B6FA8', tint: '#E0E5F3', onAccent: '#FFFFFF', onTint: '#1E2740' },
  { accent: '#8A5A8C', tint: '#EDDFEE', onAccent: '#FFFFFF', onTint: '#332033' },
  { accent: '#3F7C82', tint: '#D9ECEE', onAccent: '#FFFFFF', onTint: '#163033' },
  { accent: '#A35A5A', tint: '#F0DDDD', onAccent: '#FFFFFF', onTint: '#3A1F1F' },
];

const FALLBACK_DARK: CatalogThemeVisual[] = [
  { accent: '#E0A06E', tint: '#3A2C22', onAccent: '#1A120C', onTint: '#F3E6DA' },
  { accent: '#8FA3D9', tint: '#262C40', onAccent: '#12161F', onTint: '#E4E8F5' },
  { accent: '#C792C9', tint: '#332433', onAccent: '#1A101A', onTint: '#F0E2F0' },
  { accent: '#7EB8BD', tint: '#1E3033', onAccent: '#0C181A', onTint: '#DCECEE' },
  { accent: '#D18A8A', tint: '#3A2626', onAccent: '#1A1010', onTint: '#F0DDDD' },
];

function hashThemeId(themeId: string): number {
  let hash = 0;
  for (let index = 0; index < themeId.length; index += 1) {
    hash = (hash * 31 + themeId.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function getCatalogThemeVisual(
  themeId: string,
  scheme: ColorScheme = 'light',
): CatalogThemeVisual {
  const named = scheme === 'dark' ? NAMED_DARK : NAMED_LIGHT;
  const namedVisual = named[themeId];
  if (namedVisual) {
    return namedVisual;
  }
  const fallbacks = scheme === 'dark' ? FALLBACK_DARK : FALLBACK_LIGHT;
  return fallbacks[hashThemeId(themeId) % fallbacks.length] ?? DEFAULT_VISUAL;
}
