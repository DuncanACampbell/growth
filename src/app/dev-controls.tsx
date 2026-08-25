import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import {
  getAvailableThemes,
  getTheme,
  type PersonaId,
} from '@/data/mock';
import {
  developerCompleteOptions,
  getProgrammeProgress,
  getTodaysChallenge,
} from '@/data/progression';
import { useMockSession } from '@/lib/mock-session';
import { useTheme } from '@/theme';

const PERSONA_LABELS: Record<PersonaId, string> = {
  new: 'New user',
  incomplete: 'One theme waiting',
  complete: 'One theme done today',
};

export default function DevControlsScreen() {
  const theme = useTheme();
  const {
    isSignedIn,
    world,
    previewPersona,
    completeToday,
    resetProgress,
    resetThemeProgress,
    setThemeDayNumber,
    simulateNextDay,
    resetStreakProgress,
    loadThreeActiveThemes,
    purchaseTheme,
    resetEntitlements,
  } = useMockSession();

  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }

  const owned = world.themeProgress;
  const unlockedIds = new Set(owned.map((item) => item.themeId));
  const lockedThemes = getAvailableThemes().filter((item) => !unlockedIds.has(item.id));

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/home');
  }

  function openPurchase(themeId: string) {
    router.push({ pathname: '/theme-purchase', params: { themeId } });
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
        <View style={{ gap: theme.spacing.sm }}>
          <Pressable accessibilityRole="button" onPress={goBack}>
            <AppText variant="body" tone="primary">
              Back
            </AppText>
          </Pressable>
          <AppText variant="title">Dev Controls</AppText>
          <AppText variant="body" tone="muted">
            Prototype and testing tools
          </AppText>
        </View>

        <View style={{ gap: theme.spacing.xs }}>
          <AppText variant="caption" tone="muted">
            Current state
          </AppText>
          <AppText variant="body">
            Persona {PERSONA_LABELS[world.personaId]} ({world.personaId})
          </AppText>
          <AppText variant="body">Simulated date {world.today}</AppText>
          <AppText variant="body">Streak {world.userProgress.currentStreak}</AppText>
          {owned.length === 0 ? (
            <AppText variant="body">Owned themes none</AppText>
          ) : (
            owned.map((progress) => {
              const item = getTheme(world, progress.themeId);
              const programme = getProgrammeProgress(world, progress.themeId);
              return (
                <AppText key={progress.themeId} variant="body">
                  {item?.name ?? progress.themeId} — Day {programme.currentDay} of{' '}
                  {programme.totalDays} · {programme.completedCount} completed ·{' '}
                  {progress.status}
                </AppText>
              );
            })
          )}
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="subtitle">Persona</AppText>
          <Pressable
            accessibilityRole="button"
            onPress={() => previewPersona('new')}
          >
            <AppText variant="body" tone="primary">
              New user
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => previewPersona('incomplete')}
          >
            <AppText variant="body" tone="primary">
              One theme waiting
            </AppText>
          </Pressable>
          <Pressable
            accessibilityRole="button"
            onPress={() => previewPersona('complete')}
          >
            <AppText variant="body" tone="primary">
              One theme done today
            </AppText>
          </Pressable>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="subtitle">Date / Time</AppText>
          <Pressable accessibilityRole="button" onPress={simulateNextDay}>
            <AppText variant="body" tone="primary">
              Simulate next calendar day
            </AppText>
          </Pressable>
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="subtitle">Programme / Progress</AppText>
          <Pressable accessibilityRole="button" onPress={loadThreeActiveThemes}>
            <AppText variant="body" tone="primary">
              Load 3 active themes
            </AppText>
          </Pressable>
          {owned.map((progress) => {
            const item = getTheme(world, progress.themeId);
            return (
              <View key={`dev-${progress.themeId}`} style={{ gap: theme.spacing.xs }}>
                <AppText variant="caption" tone="muted">
                  {item?.name}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    setThemeDayNumber(progress.themeId, progress.currentDay - 1)
                  }
                >
                  <AppText variant="body" tone="primary">
                    Day −
                  </AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() =>
                    setThemeDayNumber(progress.themeId, progress.currentDay + 1)
                  }
                >
                  <AppText variant="body" tone="primary">
                    Day +
                  </AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => {
                    const challenge = getTodaysChallenge(world, progress.themeId);
                    completeToday(
                      progress.themeId,
                      challenge
                        ? developerCompleteOptions(progress.themeId, challenge.id)
                        : undefined,
                    );
                  }}
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
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="subtitle">Themes / Purchasing</AppText>
          {lockedThemes.length === 0 ? (
            <AppText variant="caption" tone="muted">
              No locked available themes
            </AppText>
          ) : (
            lockedThemes.map((item) => (
              <View key={`dev-purchase-${item.id}`} style={{ gap: theme.spacing.xs }}>
                <AppText variant="caption" tone="muted">
                  {item.name}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => openPurchase(item.id)}
                >
                  <AppText variant="body" tone="primary">
                    Open purchase
                  </AppText>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  onPress={() => purchaseTheme(item.id)}
                >
                  <AppText variant="body" tone="primary">
                    Simulate €3 purchase
                  </AppText>
                </Pressable>
              </View>
            ))
          )}
        </View>

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="subtitle">Reset</AppText>
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
          <Pressable accessibilityRole="button" onPress={resetEntitlements}>
            <AppText variant="body" tone="primary">
              Reset purchases
            </AppText>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}
