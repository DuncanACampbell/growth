import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { getTheme } from '@/data/mock';
import {
  didCompleteThemeToday,
  getCompletedTodayChallenge,
  getHomeState,
  getInProgressSession,
  getProgrammeProgress,
  getThemeExerciseHistory,
  getThemeProgress,
  getTodaysChallenge,
  getTodaysStatement,
  isProgrammeComplete,
  isThemeAvailableToday,
} from '@/data/progression';
import { useMockSession } from '@/lib/mock-session';
import { useTheme } from '@/theme';

export default function ThemeProgressScreen() {
  const theme = useTheme();
  const { isSignedIn, world } = useMockSession();
  const { themeId: themeIdParam } = useLocalSearchParams<{ themeId?: string }>();
  const themeId = typeof themeIdParam === 'string' ? themeIdParam : null;

  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }

  if (!themeId || getHomeState(world) === 'new') {
    return <Redirect href="/home" />;
  }

  const progress = getThemeProgress(world, themeId);
  const catalogTheme = getTheme(world, themeId);
  if (!progress || !catalogTheme) {
    return <Redirect href="/home" />;
  }

  const programme = getProgrammeProgress(world, themeId);
  const history = getThemeExerciseHistory(world, themeId);
  const waitingToday = isThemeAvailableToday(world, themeId);
  const completedToday = didCompleteThemeToday(world, themeId);
  const programmeComplete = isProgrammeComplete(world, themeId);
  const todaysChallenge = getTodaysChallenge(world, themeId);
  const completedTodayChallenge = getCompletedTodayChallenge(world, themeId);
  const currentChallenge = waitingToday
    ? todaysChallenge
    : completedToday
      ? completedTodayChallenge
      : null;
  const todaysStatement = getTodaysStatement(world, currentChallenge?.id ?? null);
  const inProgress = currentChallenge
    ? getInProgressSession(world, themeId, currentChallenge.id)
    : null;
  const fill =
    programme.totalDays > 0
      ? Math.min(1, programme.completedCount / programme.totalDays)
      : 0;

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/home');
  }

  function openToday() {
    if (!themeId || !currentChallenge) {
      return;
    }
    router.push({
      pathname: '/challenge',
      params: {
        themeId,
        exerciseId: currentChallenge.id,
      },
    });
  }

  const currentStatusLabel = programmeComplete
    ? 'Programme completed'
    : waitingToday
      ? inProgress
        ? 'In progress'
        : 'Available today'
      : completedToday
        ? 'Completed today'
        : `Come back tomorrow for Day ${programme.currentDay}`;

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.lg,
          gap: theme.spacing.xl,
        }}
      >
        <Pressable accessibilityRole="button" onPress={goBack}>
          <AppText variant="body" tone="primary">
            Back
          </AppText>
        </Pressable>

        <View style={{ gap: theme.spacing.sm }}>
          <AppText variant="title">{catalogTheme.name}</AppText>
          <AppText variant="body" tone="muted">
            {catalogTheme.subtitle}
          </AppText>
          <AppText variant="caption" tone="muted">
            {programme.completedCount} of {programme.totalDays} completed
            {programmeComplete
              ? ''
              : ` · Day ${programme.currentDay} of ${programme.totalDays}`}
          </AppText>
          <View
            style={{
              backgroundColor: theme.colors.surface,
              borderColor: theme.colors.border,
              borderRadius: theme.radii.md,
              borderWidth: 1,
              height: 10,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                backgroundColor: theme.colors.primary,
                height: '100%',
                width: `${Math.round(fill * 100)}%`,
              }}
            />
          </View>
        </View>

        {currentChallenge ? (
          <View
            style={{
              borderColor: theme.colors.border,
              borderRadius: theme.radii.md,
              borderWidth: 1,
              gap: theme.spacing.sm,
              padding: theme.spacing.lg,
            }}
          >
            <AppText variant="caption" tone="muted">
              Today
            </AppText>
            <AppText variant="subtitle">{currentChallenge.title}</AppText>
            <AppText variant="caption" tone="muted">
              Day {currentChallenge.day} of {currentChallenge.totalDays} · {currentStatusLabel}
            </AppText>
            {completedToday && todaysStatement?.text ? (
              <>
                <AppText variant="caption" tone="muted">
                  Thought of the day
                </AppText>
                <AppText variant="body">“{todaysStatement.text}”</AppText>
              </>
            ) : null}
            {waitingToday ? (
              <Pressable
                accessibilityRole="button"
                onPress={openToday}
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
                  {inProgress
                    ? `Continue Day ${currentChallenge.day}`
                    : 'Open today’s exercise'}
                </AppText>
              </Pressable>
            ) : null}
          </View>
        ) : (
          <View
            style={{
              borderColor: theme.colors.border,
              borderRadius: theme.radii.md,
              borderWidth: 1,
              gap: theme.spacing.sm,
              padding: theme.spacing.lg,
            }}
          >
            <AppText variant="caption" tone="muted">
              Today
            </AppText>
            <AppText variant="body">{currentStatusLabel}</AppText>
          </View>
        )}

        <View style={{ gap: theme.spacing.md }}>
          <AppText variant="subtitle">Your progress</AppText>
          {history.length === 0 ? (
            <AppText variant="body" tone="muted">
              No completed exercises in this theme yet.
            </AppText>
          ) : (
            history.map((item) => (
              <View
                key={item.exerciseId}
                style={{
                  borderColor: theme.colors.border,
                  borderRadius: theme.radii.md,
                  borderWidth: 1,
                  gap: theme.spacing.xs,
                  padding: theme.spacing.lg,
                }}
              >
                <AppText variant="caption" tone="muted">
                  Day {item.day} · {item.completedAt}
                </AppText>
                <AppText variant="body">{item.title}</AppText>
                {item.statement ? (
                  <>
                    <AppText variant="caption" tone="muted">
                      Thought of the day
                    </AppText>
                    <AppText variant="body">“{item.statement}”</AppText>
                  </>
                ) : null}
                {item.memory?.topic ? (
                  <AppText variant="caption" tone="muted">
                    {item.memory.topic}
                  </AppText>
                ) : null}
                {item.memory?.reframe ? (
                  <AppText variant="caption" tone="muted">
                    {item.memory.reframe}
                  </AppText>
                ) : null}
              </View>
            ))
          )}
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
