import { Redirect, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, View } from 'react-native';

import { CompletedExerciseCard } from '@/components/home/CompletedExerciseCard';
import { IdleThemeCard } from '@/components/home/IdleThemeCard';
import { StreakBadge } from '@/components/home/StreakBadge';
import { TodayExerciseCard } from '@/components/home/TodayExerciseCard';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import {
  getAvailableThemes,
  getComingSoonThemes,
  getTheme,
} from '@/data/mock';
import { getCatalogThemeVisual } from '@/data/theme-visuals';
import {
  didCompleteThemeToday,
  getCompletedTodayChallenge,
  getHomeState,
  getInProgressSession,
  getLatestStatementForTheme,
  getProgrammeProgress,
  getChallengeForExercise,
  getTodaysChallenge,
  getTodaysStatement,
  getWaitingThemeProgress,
} from '@/data/progression';
import { useMockSession } from '@/lib/mock-session';
import { ThemeProvider, useTheme } from '@/theme';
import type { Challenge, Theme as CatalogTheme } from '@/types/models';
import type { ThemeProgress } from '@/types/progress';

function greetingForName(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) {
    return `Good morning, ${name}`;
  }
  if (hour < 17) {
    return `Good afternoon, ${name}`;
  }
  return `Good evening, ${name}`;
}

type TodayItem =
  | {
      kind: 'waiting';
      progress: ThemeProgress;
      challenge: Challenge;
      inProgress: boolean;
    }
  | {
      kind: 'done';
      progress: ThemeProgress;
      statement: string | null;
    }
  | {
      kind: 'idle';
      progress: ThemeProgress;
      message: string;
    };

export default function HomeScreen() {
  return (
    <ThemeProvider scheme="light">
      <HomeScreenContent />
    </ThemeProvider>
  );
}

function HomeScreenContent() {
  const theme = useTheme();
  const { isSignedIn, world, signOut } = useMockSession();

  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }

  const sessionWorld = world;
  const homeState = getHomeState(sessionWorld);
  const waiting = getWaitingThemeProgress(world);
  const waitingIds = new Set(waiting.map((item) => item.themeId));
  const owned = world.themeProgress;
  const unlockedIds = new Set(owned.map((item) => item.themeId));
  const availableThemes = getAvailableThemes();
  const comingSoonThemes = getComingSoonThemes();
  const lockedThemes = availableThemes.filter((item) => !unlockedIds.has(item.id));

  const todayItems: TodayItem[] = [];
  const waitingItems: TodayItem[] = [];
  const doneItems: TodayItem[] = [];
  const idleItems: TodayItem[] = [];

  for (const progress of owned) {
    const programme = getProgrammeProgress(sessionWorld, progress.themeId);
    if (waitingIds.has(progress.themeId)) {
      const challenge = getTodaysChallenge(sessionWorld, progress.themeId);
      if (!challenge) {
        idleItems.push({
          kind: 'idle',
          progress,
          message: programme.isComplete
            ? 'Programme complete'
            : `Come back tomorrow for Day ${programme.currentDay}`,
        });
        continue;
      }
      waitingItems.push({
        kind: 'waiting',
        progress,
        challenge,
        inProgress: Boolean(
          getInProgressSession(sessionWorld, progress.themeId, challenge.id),
        ),
      });
      continue;
    }
    if (didCompleteThemeToday(sessionWorld, progress.themeId)) {
      const latestStatement = getLatestStatementForTheme(sessionWorld, progress.themeId);
      const challenge =
        getCompletedTodayChallenge(sessionWorld, progress.themeId) ??
        (latestStatement
          ? getChallengeForExercise(sessionWorld, progress.themeId, latestStatement.exerciseId)
          : null);
      const todaysStatement =
        getTodaysStatement(sessionWorld, challenge?.id ?? null) ?? latestStatement;
      doneItems.push({
        kind: 'done',
        progress,
        statement: todaysStatement?.text ?? null,
      });
      continue;
    }
    idleItems.push({
      kind: 'idle',
      progress,
      message: programme.isComplete
        ? 'Programme complete'
        : `Come back tomorrow for Day ${programme.currentDay}`,
    });
  }

  todayItems.push(...waitingItems, ...doneItems, ...idleItems);

  function openChallenge(themeId: string) {
    const challenge = getTodaysChallenge(sessionWorld, themeId);
    router.push({
      pathname: '/challenge',
      params: {
        themeId,
        ...(challenge?.id ? { exerciseId: challenge.id } : {}),
      },
    });
  }

  function openThemeProgress(themeId: string) {
    router.push({
      pathname: '/theme/[themeId]',
      params: { themeId },
    });
  }

  function openPurchase(themeId: string) {
    router.push({ pathname: '/theme-purchase', params: { themeId } });
  }

  function catalogRow(item: CatalogTheme, disabled: boolean) {
    const visual = getCatalogThemeVisual(item.id, theme.scheme);

    if (disabled) {
      return (
        <View
          key={item.id}
          accessible
          accessibilityLabel={`${item.name} coming soon`}
          accessibilityState={{ disabled: true }}
          style={{
            alignItems: 'center',
            backgroundColor: visual.tint,
            borderRadius: theme.radii.xxl,
            flexDirection: 'row',
            gap: theme.spacing.md,
            minHeight: 72,
            opacity: 0.65,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.lg,
          }}
        >
          <View style={{ flex: 1, gap: theme.spacing.xs, justifyContent: 'center' }}>
            <AppText variant="body" style={{ color: visual.onTint, fontWeight: '600' }}>
              {item.name}
            </AppText>
            <AppText variant="caption" style={{ color: visual.onTint, opacity: 0.8 }}>
              {item.subtitle}
            </AppText>
          </View>
          <View
            accessibilityElementsHidden
            importantForAccessibility="no-hide-descendants"
            style={{
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
              borderRadius: theme.radii.full,
              height: 48,
              justifyContent: 'center',
              width: 48,
            }}
          >
            <Ionicons name="lock-closed" size={18} color="#C9C3B8" />
          </View>
        </View>
      );
    }

    return (
      <View
        key={item.id}
        style={{
          alignItems: 'center',
          backgroundColor: visual.tint,
          borderRadius: theme.radii.xxl,
          flexDirection: 'row',
          gap: theme.spacing.md,
          minHeight: 72,
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.lg,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Learn more about ${item.name}`}
          onPress={() => openPurchase(item.id)}
          style={{ flex: 1, gap: theme.spacing.xs, minHeight: 48, justifyContent: 'center' }}
        >
          <AppText variant="body" style={{ color: visual.onTint, fontWeight: '600' }}>
            {item.name}
          </AppText>
          <AppText variant="caption" style={{ color: visual.onTint, opacity: 0.8 }}>
            {item.subtitle}
          </AppText>
        </Pressable>
        <AppButton
          circular
          accessibilityLabel={`Learn more about ${item.name}`}
          onPress={() => openPurchase(item.id)}
          leadingIcon={
            <Ionicons
              name="arrow-forward"
              size={20}
              color={theme.colors.buttonOnPrimary}
            />
          }
        />
      </View>
    );
  }

  return (
    <Screen>
      <View style={{ flex: 1 }}>
        <AppButton
          variant="secondary"
          accessibilityLabel="Dev Controls"
          onPress={() => router.push('/dev-controls')}
          leadingIcon={
            <Ionicons name="hammer-outline" size={18} color="#C9C3B8" />
          }
          style={{
            backgroundColor: '#F1EBE3',
            borderColor: 'transparent',
            borderWidth: 0,
            position: 'absolute',
            right: theme.spacing.md,
            top: theme.spacing.sm,
            zIndex: 2,
          }}
        />

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.lg,
            paddingBottom: theme.spacing.xxl,
            gap: theme.spacing.xxl,
          }}
        >
          <View style={{ gap: theme.spacing.md, paddingRight: 56 }}>
            <AppText variant="greeting">
              {greetingForName(sessionWorld.user.displayName)}
            </AppText>
            <StreakBadge currentStreak={sessionWorld.userProgress.currentStreak} />
          </View>

          {homeState === 'new' ? (
            <View style={{ gap: theme.spacing.lg }}>
              <View style={{ gap: theme.spacing.xs }}>
                <AppText variant="title">Today</AppText>
                <AppText variant="body" tone="muted">
                  Choose a theme to unlock your first conversation.
                </AppText>
              </View>
              {availableThemes.map((item) => catalogRow(item, false))}
              {comingSoonThemes.map((item) => catalogRow(item, true))}
            </View>
          ) : (
            <View style={{ gap: theme.spacing.lg }}>
              <AppText variant="title">Today</AppText>
              {todayItems.map((item) => {
                const catalog = getTheme(sessionWorld, item.progress.themeId);
                const visual = getCatalogThemeVisual(item.progress.themeId, theme.scheme);
                const themeName = catalog?.name ?? item.progress.themeId;
                if (item.kind === 'waiting') {
                  return (
                    <TodayExerciseCard
                      key={`wait-${item.progress.themeId}`}
                      themeName={themeName}
                      day={item.challenge.day}
                      totalDays={item.challenge.totalDays}
                      title={item.challenge.title}
                      subtitle={catalog?.subtitle}
                      actionLabel={item.inProgress ? 'Continue' : 'Start'}
                      visual={visual}
                      onOpenTheme={() => openThemeProgress(item.progress.themeId)}
                      onStart={() => openChallenge(item.progress.themeId)}
                    />
                  );
                }
                if (item.kind === 'done') {
                  return (
                    <CompletedExerciseCard
                      key={`done-${item.progress.themeId}`}
                      themeName={themeName}
                      statement={item.statement}
                      visual={visual}
                      onOpenTheme={() => openThemeProgress(item.progress.themeId)}
                    />
                  );
                }
                return (
                  <IdleThemeCard
                    key={`idle-${item.progress.themeId}`}
                    themeName={themeName}
                    message={item.message}
                    visual={visual}
                    onOpenTheme={() => openThemeProgress(item.progress.themeId)}
                  />
                );
              })}
            </View>
          )}

          {homeState !== 'new' ? (
            <View style={{ gap: theme.spacing.lg }}>
              {lockedThemes.length > 0 ? (
                <View style={{ gap: theme.spacing.md }}>
                  <AppText variant="subtitle">Unlock another theme</AppText>
                  {lockedThemes.map((item) => catalogRow(item, false))}
                </View>
              ) : null}
              <View style={{ gap: theme.spacing.md }}>
                <AppText variant="caption" tone="muted">
                  Coming soon
                </AppText>
                {comingSoonThemes.map((item) => catalogRow(item, true))}
              </View>
            </View>
          ) : null}

          <View
            style={{
              alignItems: 'center',
              marginTop: 'auto',
              paddingTop: theme.spacing.xl,
            }}
          >
            <AppButton
              variant="secondary"
              accessibilityLabel="Log out"
              onPress={() => {
                signOut();
                router.replace('/login');
              }}
              leadingIcon={
                <Ionicons
                  name="log-out-outline"
                  size={18}
                  color={theme.colors.buttonOnSecondary}
                />
              }
            >
              Log out
            </AppButton>
          </View>
        </ScrollView>
      </View>
    </Screen>
  );
}
