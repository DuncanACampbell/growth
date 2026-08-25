import { Redirect, router } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { CompletedExerciseCard } from '@/components/home/CompletedExerciseCard';
import { IdleThemeCard } from '@/components/home/IdleThemeCard';
import { TodayExerciseCard } from '@/components/home/TodayExerciseCard';
import { WeeklyStreak } from '@/components/home/WeeklyStreak';
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
import { getWeekStripDays } from '@/lib/week-streak';
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
  const weekDays = getWeekStripDays({
    today: world.today,
    currentStreak: world.userProgress.currentStreak,
    lastActivityDate: world.userProgress.lastActivityDate,
    activityDates: world.statements.map((item) => item.date),
  });

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
    const content = (
      <View
        style={{
          backgroundColor: visual.tint,
          borderRadius: theme.radii.xxl,
          gap: theme.spacing.xs,
          minHeight: 72,
          opacity: disabled ? 0.65 : 1,
          padding: theme.spacing.xl,
        }}
      >
        <AppText variant="body" style={{ color: visual.onTint, fontWeight: '600' }}>
          {item.name}
        </AppText>
        <AppText variant="caption" style={{ color: visual.onTint, opacity: 0.8 }}>
          {item.subtitle}
        </AppText>
        {disabled ? (
          <AppText variant="caption" style={{ color: visual.onTint, opacity: 0.7 }}>
            Coming soon
          </AppText>
        ) : null}
      </View>
    );

    if (disabled) {
      return (
        <View key={item.id} accessibilityState={{ disabled: true }}>
          {content}
        </View>
      );
    }

    return (
      <Pressable
        key={item.id}
        accessibilityRole="button"
        onPress={() => openPurchase(item.id)}
      >
        {content}
      </Pressable>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.lg,
          paddingBottom: theme.spacing.xxxl,
          gap: theme.spacing.xxl,
        }}
      >
        <View
          style={{
            alignItems: 'flex-start',
            flexDirection: 'row',
            gap: theme.spacing.md,
            justifyContent: 'space-between',
          }}
        >
          <AppText variant="greeting" style={{ flex: 1, paddingRight: theme.spacing.sm }}>
            {greetingForName(sessionWorld.user.displayName)}
          </AppText>
          <View style={{ alignItems: 'flex-end', gap: theme.spacing.xs }}>
            <Pressable
              accessibilityRole="button"
              hitSlop={6}
              onPress={() => router.push('/dev-controls')}
              style={{ minHeight: 44, justifyContent: 'center' }}
            >
              <AppText variant="caption" tone="muted">
                Dev Controls
              </AppText>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              hitSlop={6}
              onPress={() => {
                signOut();
                router.replace('/login');
              }}
              style={{ minHeight: 44, justifyContent: 'center' }}
            >
              <AppText variant="caption" tone="muted">
                Log out
              </AppText>
            </Pressable>
          </View>
        </View>

        <WeeklyStreak
          days={weekDays}
          currentStreak={sessionWorld.userProgress.currentStreak}
        />

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
      </ScrollView>
    </Screen>
  );
}
