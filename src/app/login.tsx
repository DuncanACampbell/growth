import { Redirect, router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import type { PersonaId } from '@/data/mock';
import { useMockSession } from '@/lib/mock-session';
import { useTheme } from '@/theme';

export default function LoginScreen() {
  const theme = useTheme();
  const { isSignedIn, signIn, signUp } = useMockSession();

  if (isSignedIn) {
    return <Redirect href="/home" />;
  }

  function enter(personaId: PersonaId) {
    signIn(personaId);
    router.replace('/home');
  }

  return (
    <Screen
      style={[
        styles.screen,
        {
          paddingHorizontal: theme.spacing.xl,
          gap: theme.spacing.xl,
        },
      ]}
    >
      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="title">Growth</AppText>
        <AppText variant="body" tone="muted">
          Log in or create an account. Actions are placeholders until Firebase
          is connected.
        </AppText>
      </View>

      <View style={{ gap: theme.spacing.md }}>
        <AppButton fullWidth onPress={() => enter('incomplete')}>
          Log in
        </AppButton>
        <AppButton
          fullWidth
          variant="secondary"
          onPress={() => {
            signUp();
            router.replace('/home');
          }}
        >
          Sign up
        </AppButton>
      </View>

      <View style={{ gap: theme.spacing.sm }}>
        <AppText variant="caption" tone="muted">
          Preview home states (mock data)
        </AppText>
        <Pressable onPress={() => enter('new')} accessibilityRole="button">
          <AppText variant="body" tone="primary">
            New user
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => enter('incomplete')}
          accessibilityRole="button"
        >
          <AppText variant="body" tone="primary">
            Returning — today not done
          </AppText>
        </Pressable>
        <Pressable
          onPress={() => enter('complete')}
          accessibilityRole="button"
        >
          <AppText variant="body" tone="primary">
            Returning — today complete
          </AppText>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
  },
});
