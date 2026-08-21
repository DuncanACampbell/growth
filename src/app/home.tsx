import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import type { PersonaId } from '@/data/mock';
import {
  getHomeState,
  getPreviousCompletions,
  getTheme,
  getTodaysChallenge,
  getTodaysStatement,
} from '@/data/mock';
import { useMockSession } from '@/lib/mock-session';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const { isSignedIn, world, signOut, selectTheme, previewPersona } =
    useMockSession();

  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }

  const homeState = getHomeState(world);
  const selectedTheme = getTheme(world, world.user.selectedThemeId);
  const todaysChallenge = getTodaysChallenge(world, world.user.selectedThemeId);
  const todaysStatement = getTodaysStatement(world, todaysChallenge?.id ?? null);
  const previous = getPreviousCompletions(world);

  function switchPersona(personaId: PersonaId) {
    previewPersona(personaId);
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.lg,
          gap: theme.spacing.xl,
        }}
      >
        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="title">Home</AppText>
          <AppText variant="body" tone="muted">
            Hi {world.user.displayName}
          </AppText>
        </View>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="caption" tone="muted">
            Streak
          </AppText>
          <AppText variant="subtitle">{world.user.currentStreak}</AppText>
        </View>

        {homeState === 'new' ? (
          <View style={{ gap: theme.spacing.md }}>
            <AppText variant="subtitle">Choose a theme</AppText>
            <AppText variant="body" tone="muted">
              No theme selected yet. Pick the one you want to work on.
            </AppText>
            {world.themes.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => selectTheme(item.id)}
                style={{
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radii.md,
                  borderWidth: 1,
                  gap: theme.spacing.xs,
                  padding: theme.spacing.lg,
                }}
              >
                <AppText variant="body">{item.name}</AppText>
                <AppText variant="caption" tone="muted">
                  {item.description}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={{ gap: theme.spacing.xs }}>
            <AppText variant="caption" tone="muted">
              Current theme
            </AppText>
            <AppText variant="subtitle">{selectedTheme?.name}</AppText>
          </View>
        )}

        {homeState === 'challenge_open' && todaysChallenge ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/challenge')}
            style={[
              styles.button,
              {
                backgroundColor: theme.colors.primary,
                borderRadius: theme.radii.md,
                padding: theme.spacing.md,
              },
            ]}
          >
            <AppText variant="body" tone="onPrimary">
              Today’s challenge — {todaysChallenge.title}
            </AppText>
          </Pressable>
        ) : null}

        {homeState === 'challenge_complete' && todaysChallenge ? (
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.md,
              borderWidth: 1,
              gap: theme.spacing.sm,
              padding: theme.spacing.lg,
            }}
          >
            <AppText variant="caption" tone="muted">
              Today’s challenge — completed
            </AppText>
            <AppText variant="body">{todaysChallenge.title}</AppText>
            <AppText variant="caption" tone="muted">
              Statement of the day
            </AppText>
            <AppText variant="subtitle">{todaysStatement?.text}</AppText>
          </View>
        ) : null}

        {previous.length > 0 ? (
          <View style={{ gap: theme.spacing.md }}>
            <AppText variant="subtitle">Previous challenges</AppText>
            {previous.map((item) => (
              <View
                key={item.challenge.id}
                style={{
                  borderColor: theme.colors.border,
                  borderRadius: theme.radii.md,
                  borderWidth: 1,
                  gap: theme.spacing.xs,
                  padding: theme.spacing.lg,
                }}
              >
                <AppText variant="caption" tone="muted">
                  {item.challenge.date}
                </AppText>
                <AppText variant="body">{item.challenge.title}</AppText>
                <AppText variant="caption" tone="muted">
                  Statement of the day
                </AppText>
                <AppText variant="body">{item.statement.text}</AppText>
              </View>
            ))}
          </View>
        ) : null}

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="caption" tone="muted">
            Preview another home state
          </AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => switchPersona('new')}
          >
            <AppText variant="body" tone="primary">
              New user
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => switchPersona('incomplete')}
          >
            <AppText variant="body" tone="primary">
              Today not done
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => switchPersona('complete')}
          >
            <AppText variant="body" tone="primary">
              Today complete
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => {
              signOut();
              router.replace('/login');
            }}
          >
            <AppText variant="body" tone="muted">
              Sign out
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
  },
});
