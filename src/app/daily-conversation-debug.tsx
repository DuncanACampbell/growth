import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { DailyConversationDebug } from '@/components/DailyConversationDebug';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useMockSession } from '@/lib/mock-session';
import { ThemeProvider, useTheme } from '@/theme';

export default function DailyConversationDebugScreen() {
  return (
    <ThemeProvider scheme="light">
      <DailyConversationDebugScreenContent />
    </ThemeProvider>
  );
}

function DailyConversationDebugScreenContent() {
  const theme = useTheme();
  const { isSignedIn, world } = useMockSession();

  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/daily-conversation');
  }

  return (
    <Screen>
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          paddingHorizontal: theme.spacing.md,
          paddingTop: theme.spacing.sm,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={goBack}
          style={{
            alignItems: 'center',
            height: 44,
            justifyContent: 'center',
            width: 44,
          }}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>
        <AppText variant="body" style={{ flex: 1, fontWeight: '600' }}>
          Conversation assessment
        </AppText>
      </View>
      <View style={styles.fill}>
        <DailyConversationDebug />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
