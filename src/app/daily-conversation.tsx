import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';

import { DailyConversation } from '@/components/DailyConversation';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useMockSession } from '@/lib/mock-session';
import { ThemeProvider, useTheme } from '@/theme';

export default function DailyConversationScreen() {
  return (
    <ThemeProvider scheme="light">
      <DailyConversationScreenContent />
    </ThemeProvider>
  );
}

function DailyConversationScreenContent() {
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
    router.replace('/home');
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={styles.fill}
      >
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
            Today
          </AppText>
        </View>
        <View
          style={[
            styles.fill,
            {
              paddingBottom: theme.spacing.lg,
              paddingHorizontal: theme.spacing.xl,
            },
          ]}
        >
          <DailyConversation />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
