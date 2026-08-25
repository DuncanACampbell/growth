import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import { StyleSheet, type TextStyle } from 'react-native';

/** Weights loaded at app startup for Plus Jakarta Sans. */
export const appFontSources = {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
};

export const appFonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
} as const;

type FontWeightKey = keyof typeof appFonts;

function normalizeWeight(
  weight: TextStyle['fontWeight'] | undefined,
): FontWeightKey {
  const value = String(weight ?? '400').toLowerCase();
  if (
    value === '500' ||
    value === 'medium'
  ) {
    return 'medium';
  }
  if (
    value === '600' ||
    value === 'semibold' ||
    value === 'semi-bold'
  ) {
    return 'semibold';
  }
  if (
    value === '700' ||
    value === '800' ||
    value === '900' ||
    value === 'bold' ||
    value === 'heavy' ||
    value === 'black'
  ) {
    return 'bold';
  }
  return 'regular';
}

/**
 * Map semantic fontWeight to the matching loaded Plus Jakarta Sans face.
 * Clears fontWeight so iOS/Android do not synthesize a different weight.
 */
export function resolveAppTextStyle(style: TextStyle | TextStyle[]): TextStyle {
  const flat = StyleSheet.flatten(style) ?? {};
  const family = appFonts[normalizeWeight(flat.fontWeight)];
  return {
    ...flat,
    fontFamily: family,
    fontWeight: 'normal',
  };
}
