import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { MockSessionProvider } from '@/lib/mock-session';
import { ThemeProvider } from '@/theme';

export default function RootLayout() {
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
