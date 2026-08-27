import { Stack } from 'expo-router';

import { ThemeProvider } from '@/theme';
import { growthOnboardingGradient } from '@/theme/brand';

/**
 * Onboarding stack only — the coral gradient lives on each screen via
 * OnboardingShell. Wrapping Stack in a gradient left a pink header + grey
 * body because the native stack paints an opaque scene behind screens.
 */
export default function OnboardingLayout() {
  return (
    <ThemeProvider scheme="light">
      <Stack
        screenOptions={{
          animation: 'slide_from_right',
          animationDuration: 240,
          // Match bottom wash stop so any native stack flash stays coral, not grey.
          contentStyle: {
            backgroundColor: growthOnboardingGradient[2],
          },
          headerShown: false,
        }}
      />
    </ThemeProvider>
  );
}
