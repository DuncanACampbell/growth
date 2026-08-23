import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { MOCK_THEMES, getTheme, type PersonaId } from '@/data/mock';
import {
  didCompleteThemeToday,
  getCompletedTodayChallenge,
  getHomeState,
  getPreviousCompletions,
  getTodaysChallenge,
  getTodaysStatement,
  getWaitingThemeProgress,
} from '@/data/progression';
import { useMockSession } from '@/lib/mock-session';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const {
    isSignedIn,
    world,
    signOut,
    previewPersona,
    completeToday,
    resetProgress,
    resetThemeProgress,
    setThemeDayNumber,
    simulateNextDay,
    resetStreakProgress,
    loadThreeActiveThemes,
  } = useMockSession();

  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }

  const homeState = getHomeState(world);
  const waiting = getWaitingThemeProgress(world);
  const owned = world.themeProgress;
  const listedThemes = owned.filter((progress) => {
    const waitingToday = waiting.some((entry) => entry.themeId === progress.themeId);
    const completedToday = didCompleteThemeToday(world, progress.themeId);
    return !(completedToday && !waitingToday);
  });
  const previous = getPreviousCompletions(world);
  const unlockedIds = new Set(owned.map((item) => item.themeId));
  const lockedThemes = MOCK_THEMES.filter((item) => !unlockedIds.has(item.id));

  function openChallenge(themeId: string) {
    router.push({ pathname: '/challenge', params: { themeId } });
  }

  function openPurchase(themeId: string) {
    router.push({ pathname: '/theme-purchase', params: { themeId } });
  }

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
          <AppText variant="caption" tone="muted">
            Calendar {world.today}
          </AppText>
        </View>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="caption" tone="muted">
            Streak
          </AppText>
          <AppText variant="subtitle">{world.userProgress.currentStreak}</AppText>
        </View>

        {homeState === 'new' ? (
          <View style={{ gap: theme.spacing.md }}>
            <AppText variant="subtitle">Choose a theme</AppText>
            <AppText variant="body" tone="muted">
              No theme unlocked yet. Pick one to see the programme and unlock it.
            </AppText>
            {MOCK_THEMES.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => openPurchase(item.id)}
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
        ) : listedThemes.length > 0 ? (
          <View style={{ gap: theme.spacing.md }}>
            <AppText variant="subtitle">Your themes</AppText>
            {listedThemes.map((progress) => {
              const waitingToday = waiting.some((entry) => entry.themeId === progress.themeId);
              const item = getTheme(world, progress.themeId);
              const statusLabel =
                progress.status === 'completed'
                  ? 'Completed'
                  : waitingToday
                    ? 'Waiting'
                    : `Come back tomorrow for Day ${progress.currentDay}`;
              return (
                <View
                  key={progress.themeId}
                  style={{
                    borderColor: theme.colors.border,
                    borderRadius: theme.radii.md,
                    borderWidth: 1,
                    gap: theme.spacing.xs,
                    padding: theme.spacing.lg,
                  }}
                >
                  <AppText variant="body">{item?.name ?? progress.themeId}</AppText>
                  <AppText variant="caption" tone="muted">
                    Day {progress.currentDay} of 30 · {statusLabel}
                  </AppText>
                </View>
              );
            })}
          </View>
        ) : null}

        {waiting.map((progress) => {
          const challenge = getTodaysChallenge(world, progress.themeId);
          const item = getTheme(world, progress.themeId);
          if (!challenge) {
            return null;
          }
          return (
            <Pressable
              key={`wait-${progress.themeId}`}
              accessibilityRole="button"
              onPress={() => openChallenge(progress.themeId)}
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
                {item?.name} — {challenge.title}
              </AppText>
            </Pressable>
          );
        })}

        {owned.map((progress) => {
          if (!didCompleteThemeToday(world, progress.themeId)) {
            return null;
          }
          const challenge = getCompletedTodayChallenge(world, progress.themeId);
          const todaysStatement = getTodaysStatement(world, challenge?.id ?? null);
          const item = getTheme(world, progress.themeId);
          const waitingToday = waiting.some((entry) => entry.themeId === progress.themeId);
          if (!challenge) {
            return null;
          }
          return (
            <View
              key={`done-${progress.themeId}`}
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
                {item?.name} — completed
              </AppText>
              <AppText variant="body">{challenge.title}</AppText>
              <AppText variant="caption" tone="muted">
                Statement of the day
              </AppText>
              <AppText variant="subtitle">{todaysStatement?.text}</AppText>
              {!waitingToday && progress.status === 'active' ? (
                <AppText variant="caption" tone="muted">
                  Come back tomorrow for Day {progress.currentDay}
                </AppText>
              ) : null}
            </View>
          );
        })}

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
                  {item.challenge.date} · {getTheme(world, item.challenge.themeId)?.name}
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

        {lockedThemes.length > 0 && homeState !== 'new' ? (
          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="caption" tone="muted">
              Unlock another theme
            </AppText>
            {lockedThemes.map((item) => (
              <Pressable
                key={item.id}
                accessibilityRole="button"
                onPress={() => openPurchase(item.id)}
              >
                <AppText variant="body" tone="primary">
                  Unlock {item.name}
                </AppText>
              </Pressable>
            ))}
          </View>
        ) : null}

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="caption" tone="muted">
            Developer controls
          </AppText>
          <Pressable accessibilityRole="button" onPress={loadThreeActiveThemes}>
            <AppText variant="body" tone="primary">
              Load 3 active themes
            </AppText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={simulateNextDay}>
            <AppText variant="body" tone="primary">
              Simulate next calendar day
            </AppText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={resetStreakProgress}>
            <AppText variant="body" tone="primary">
              Reset streak
            </AppText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={resetProgress}>
            <AppText variant="body" tone="primary">
              Reset all progress
            </AppText>
          </Pressable>
          {lockedThemes.map((item) => (
            <Pressable
              key={`dev-purchase-${item.id}`}
              accessibilityRole="button"
              onPress={() => openPurchase(item.id)}
            >
              <AppText variant="body" tone="primary">
                Open purchase — {item.name}
              </AppText>
            </Pressable>
          ))}
          {owned.map((progress) => {
            const item = getTheme(world, progress.themeId);
            return (
              <View key={`dev-${progress.themeId}`} style={{ gap: theme.spacing.xs }}>
                <AppText variant="caption" tone="muted">
                  {item?.name}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setThemeDayNumber(progress.themeId, progress.currentDay - 1)}
                >
                  <AppText variant="body" tone="primary">
                    Day −
                  </AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => setThemeDayNumber(progress.themeId, progress.currentDay + 1)}
                >
                  <AppText variant="body" tone="primary">
                    Day +
                  </AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => completeToday(progress.themeId)}
                >
                  <AppText variant="body" tone="primary">
                    Complete current session
                  </AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => resetThemeProgress(progress.themeId)}
                >
                  <AppText variant="body" tone="primary">
                    Reset to locked
                  </AppText>
                </Pressable>
              </View>
            );
          })}
          <Pressable accessibilityRole="button" onPress={() => switchPersona('new')}>
            <AppText variant="body" tone="primary">
              New user
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => switchPersona('incomplete')}
          >
            <AppText variant="body" tone="primary">
              One theme waiting
            </AppText>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => switchPersona('complete')}>
            <AppText variant="body" tone="primary">
              One theme done today
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
