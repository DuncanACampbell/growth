import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MockSessionProvider } from '@/lib/mock-session';
import { ThemeProvider } from '@/theme';
import { appFontSources } from '@/theme/fonts';

SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore if the splash screen is already managed.
});

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts(appFontSources);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <MockSessionProvider>
          <StatusBar style="auto" />
          <Stack screenOptions={{ headerShown: false }} />
        </MockSessionProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
