import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import {
  ReflectionItem,
  reflectionVariantForIndex,
} from '@/components/theme/ReflectionItem';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { getTheme } from '@/data/mock';
import { getCatalogThemeVisual } from '@/data/theme-visuals';
import {
  getHomeState,
  getInProgressSession,
  getProgrammeProgress,
  getThemeExerciseHistory,
  getThemeProgress,
  getTodaysChallenge,
  isProgrammeComplete,
  isThemeAvailableToday,
} from '@/data/progression';
import { useMockSession } from '@/lib/mock-session';
import { ThemeProvider, useTheme } from '@/theme';

export default function ThemeProgressScreen() {
  return (
    <ThemeProvider scheme="light">
      <ThemeProgressContent />
    </ThemeProvider>
  );
}

function ThemeProgressContent() {
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
  const historyNewestFirst = [...getThemeExerciseHistory(world, themeId)].sort(
    (a, b) => b.day - a.day,
  );
  const waitingToday = isThemeAvailableToday(world, themeId);
  const programmeComplete = isProgrammeComplete(world, themeId);
  const todaysChallenge = waitingToday ? getTodaysChallenge(world, themeId) : null;
  const inProgress = todaysChallenge
    ? getInProgressSession(world, themeId, todaysChallenge.id)
    : null;
  const visual = getCatalogThemeVisual(themeId, 'light');
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
    if (!themeId || !todaysChallenge) {
      return;
    }
    router.push({
      pathname: '/challenge',
      params: {
        themeId,
        exerciseId: todaysChallenge.id,
      },
    });
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingBottom: theme.spacing.xxxl,
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.md,
          gap: theme.spacing.xxl,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={goBack}
          style={{
            alignItems: 'center',
            alignSelf: 'flex-start',
            height: 44,
            justifyContent: 'center',
            width: 44,
          }}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>

        <View style={{ gap: theme.spacing.lg }}>
          <View style={{ gap: theme.spacing.sm }}>
            <AppText
              variant="title"
              style={{ color: visual.accent, fontWeight: '700' }}
            >
              {catalogTheme.name}
            </AppText>
            <AppText variant="body" tone="muted">
              {catalogTheme.subtitle}
            </AppText>
          </View>

          <View style={{ gap: theme.spacing.sm }}>
            <AppText
              variant="caption"
              style={{ color: visual.onTint, fontWeight: '600' }}
            >
              {programme.completedCount} of {programme.totalDays} days
            </AppText>
            <View
              style={{
                backgroundColor: visual.tint,
                borderRadius: theme.radii.full,
                height: 8,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  backgroundColor: visual.accent,
                  borderRadius: theme.radii.full,
                  height: '100%',
                  width: `${Math.round(fill * 100)}%`,
                }}
              />
            </View>
          </View>
        </View>

        {waitingToday && todaysChallenge && !programmeComplete ? (
          <View
            style={{
              backgroundColor: visual.tint,
              borderRadius: theme.radii.xxl,
              gap: theme.spacing.md,
              padding: theme.spacing.xl,
            }}
          >
            <AppText
              variant="caption"
              style={{ color: visual.accent, fontWeight: '600' }}
            >
              Today · Day {todaysChallenge.day} of {todaysChallenge.totalDays}
            </AppText>
            <AppText
              variant="subtitle"
              style={{ color: visual.onTint, fontSize: 22, lineHeight: 28 }}
            >
              {todaysChallenge.title}
            </AppText>
            <AppButton fullWidth onPress={openToday}>
              {inProgress
                ? `Continue Day ${todaysChallenge.day}`
                : 'Start'}
            </AppButton>
          </View>
        ) : null}

        {historyNewestFirst.length > 0 ? (
          <View style={{ gap: theme.spacing.lg }}>
            <AppText variant="subtitle">Your reflections</AppText>
            <View style={{ gap: theme.spacing.md }}>
              {historyNewestFirst.map((item, index) => (
                <ReflectionItem
                  key={item.exerciseId}
                  statement={item.statement}
                  day={item.day}
                  completedAt={item.completedAt}
                  visual={visual}
                  variant={reflectionVariantForIndex(index)}
                />
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
