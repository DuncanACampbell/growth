import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from 'react-native';

import { GuidedExerciseChat } from '@/components/GuidedExerciseChat';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import {
  getCatalogTheme,
  getExampleStatement,
  getGuidedTurns,
  getProgrammeForTheme,
  getTheme,
} from '@/data/mock';
import { getCatalogThemeVisual } from '@/data/theme-visuals';
import {
  getChallengeForExercise,
  getHomeState,
  getInProgressSession,
  getPriorProgrammeMemories,
  getStatementForChallenge,
  getTodaysChallenge,
  getTodaysStatement,
  isExerciseAvailableToStart,
  isExerciseCompleted,
  isExerciseUnlocked,
} from '@/data/progression';
import { displayStatement } from '@/lib/display-statement';
import { useMockSession } from '@/lib/mock-session';
import { ThemeProvider, useTheme } from '@/theme';
import type { ChallengeMessage } from '@/types/models';

export default function ChallengeScreen() {
  return (
    <ThemeProvider scheme="light">
      <ChallengeScreenContent />
    </ThemeProvider>
  );
}

function ChallengeScreenContent() {
  const theme = useTheme();
  const { isSignedIn, world, completeToday, saveInProgressSession } =
    useMockSession();
  const { themeId: themeIdParam, exerciseId: exerciseIdParam } =
    useLocalSearchParams<{
      themeId?: string;
      exerciseId?: string;
    }>();
  const [turnIndex, setTurnIndex] = useState(0);
  const [awaitingReply, setAwaitingReply] = useState(true);
  const [keepLiveChat, setKeepLiveChat] = useState(false);

  const themeId =
    (typeof themeIdParam === 'string' && themeIdParam.length > 0
      ? themeIdParam
      : world?.user.selectedThemeId) ?? null;
  const availableChallenge = world ? getTodaysChallenge(world, themeId) : null;
  const requestedFromParams =
    typeof exerciseIdParam === 'string' && exerciseIdParam.length > 0
      ? exerciseIdParam
      : null;
  const pinnedExerciseId = useRef<string | null>(requestedFromParams);
  if (!pinnedExerciseId.current && availableChallenge?.id) {
    pinnedExerciseId.current = availableChallenge.id;
  }
  const requestedExerciseId = pinnedExerciseId.current;

  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }

  if (!themeId || getHomeState(world) === 'new') {
    return <Redirect href="/home" />;
  }

  if (
    !requestedExerciseId ||
    !isExerciseUnlocked(world, themeId, requestedExerciseId)
  ) {
    return <Redirect href="/home" />;
  }

  const inProgress = getInProgressSession(world, themeId, requestedExerciseId);
  const todaysChallenge = getChallengeForExercise(
    world,
    themeId,
    requestedExerciseId,
  );
  if (!todaysChallenge) {
    return <Redirect href="/home" />;
  }

  const canStart = isExerciseAvailableToStart(world, themeId, requestedExerciseId);
  const exerciseComplete = isExerciseCompleted(world, requestedExerciseId);
  const showCompletion = exerciseComplete && !keepLiveChat;
  const todaysStatement =
    getStatementForChallenge(world, todaysChallenge.id) ??
    getTodaysStatement(world, todaysChallenge.id);
  const guidedTurns = getGuidedTurns(todaysChallenge.id);
  const useLiveGuidedChat = Boolean(getProgrammeForTheme(themeId));
  const catalogTheme =
    getTheme(world, themeId) ?? getCatalogTheme(themeId);
  const visual = getCatalogThemeVisual(themeId, 'light');
  const themeName = catalogTheme?.name ?? themeId;

  const liveMessages: ChallengeMessage[] = [];
  for (let index = 0; index < turnIndex; index += 1) {
    const turn = guidedTurns[index];
    if (!turn) {
      continue;
    }
    liveMessages.push({
      id: `guide-${index}`,
      role: 'guide',
      text: turn.guideText,
    });
    liveMessages.push({
      id: `user-${index}`,
      role: 'user',
      text: turn.userReply,
    });
  }
  const currentTurn = guidedTurns[turnIndex];
  if (currentTurn) {
    liveMessages.push({
      id: `guide-${turnIndex}`,
      role: 'guide',
      text: currentTurn.guideText,
    });
    if (!awaitingReply) {
      liveMessages.push({
        id: `user-${turnIndex}`,
        role: 'user',
        text: currentTurn.userReply,
      });
    }
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/home');
  }

  function sendMockReply() {
    const current = guidedTurns[turnIndex];
    if (!current) {
      return;
    }

    setAwaitingReply(false);

    const isLastTurn = turnIndex >= guidedTurns.length - 1;
    if (isLastTurn) {
      completeToday(themeId ?? undefined);
      return;
    }

    setTurnIndex((index) => index + 1);
    setAwaitingReply(true);
  }

  const header = (
    <View
      style={{
        alignItems: 'center',
        flexDirection: 'row',
        gap: theme.spacing.sm,
        paddingBottom: theme.spacing.sm,
        paddingHorizontal: theme.spacing.xl,
        paddingTop: theme.spacing.md,
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
      <AppText variant="body" numberOfLines={1} style={{ flex: 1 }}>
        <AppText
          variant="body"
          style={{ color: visual.accent, fontWeight: '600' }}
        >
          {themeName}
        </AppText>
        <AppText variant="body" tone="muted">
          {` · Day ${todaysChallenge.day} of ${todaysChallenge.totalDays}`}
        </AppText>
      </AppText>
    </View>
  );

  if (useLiveGuidedChat && (canStart || keepLiveChat)) {
    return (
      <Screen>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
          style={styles.fill}
        >
          {header}
          <View
            style={[
              styles.fill,
              {
                paddingBottom: theme.spacing.lg,
                paddingHorizontal: theme.spacing.xl,
              },
            ]}
          >
            <GuidedExerciseChat
              sessionId={inProgress?.id ?? todaysChallenge.id}
              themeId={themeId}
              exerciseId={todaysChallenge.id}
              visual={visual}
              previousMemory={getPriorProgrammeMemories(
                world,
                themeId,
                todaysChallenge.id,
              )}
              initialMessages={inProgress?.messages}
              onHistorySave={(messages) => {
                saveInProgressSession({
                  themeId,
                  exerciseId: todaysChallenge.id,
                  messages,
                  sessionId: inProgress?.id,
                });
              }}
              onComplete={(statement, memory, messages) => {
                setKeepLiveChat(true);
                const finalStatement =
                  statement?.trim() || memory?.reframe || '';
                completeToday(themeId ?? undefined, {
                  finalStatement: statement,
                  messages,
                  memory: {
                    themeId,
                    exerciseId: todaysChallenge.id,
                    topic: memory?.topic || "Today's personal growth conversation",
                    pattern:
                      memory?.pattern ||
                      'The user was examining a meaningful pattern, belief or reaction in a specific situation.',
                    reframe: memory?.reframe || finalStatement,
                    finalStatement,
                    memoryNote:
                      memory?.memoryNote ||
                      'Stay with the distinction they reached rather than asking them to rediscover it from scratch.',
                  },
                });
              }}
            />
          </View>
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  const completedTakeaway = displayStatement(
    todaysStatement?.text ??
      getExampleStatement(todaysChallenge.id) ??
      todaysChallenge.title,
  );

  return (
    <Screen>
      {header}
      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.xl,
          paddingBottom: theme.spacing.xxxl,
          paddingHorizontal: theme.spacing.xl,
        }}
      >
        {showCompletion ? (
          <View
            style={{
              backgroundColor: visual.tint,
              borderRadius: theme.radii.xxl,
              gap: theme.spacing.xl,
              marginTop: theme.spacing.lg,
              paddingHorizontal: theme.spacing.xl,
              paddingVertical: theme.spacing.xxl,
            }}
          >
            <AppText
              variant="subtitle"
              style={{
                color: visual.onTint,
                fontSize: 22,
                fontWeight: '600',
                lineHeight: 32,
                textAlign: 'center',
              }}
            >
              {completedTakeaway}
            </AppText>
            <AppButton fullWidth onPress={() => router.replace('/home')}>
              Back to Home
            </AppButton>
          </View>
        ) : (
          <>
            <View style={{ gap: theme.spacing.xl, paddingTop: theme.spacing.xxxl + theme.spacing.md }}>
              {liveMessages.map((message, index) => {
                const previous = index > 0 ? liveMessages[index - 1] : null;
                const marginTop =
                  index === 0
                    ? 0
                    : previous?.role === 'user' && message.role === 'guide'
                      ? theme.spacing.xxxl + theme.spacing.md
                      : theme.spacing.xl;

                return message.role === 'user' ? (
                  <View
                    key={message.id}
                    style={{
                      alignSelf: 'flex-end',
                      backgroundColor: visual.tint,
                      borderRadius: theme.radii.xxl,
                      marginTop,
                      maxWidth: '82%',
                      paddingHorizontal: theme.spacing.lg,
                      paddingVertical: theme.spacing.md,
                    }}
                  >
                    <AppText
                      variant="body"
                      style={{ color: visual.onTint, lineHeight: 24 }}
                    >
                      {message.text}
                    </AppText>
                  </View>
                ) : (
                  <View
                    key={message.id}
                    style={{
                      alignSelf: 'flex-start',
                      marginTop,
                      maxWidth: '78%',
                      width: '78%',
                    }}
                  >
                    <AppText
                      variant="body"
                      style={{
                        color: theme.colors.text,
                        fontSize: 17,
                        letterSpacing: -0.15,
                        lineHeight: 25,
                      }}
                    >
                      {message.text}
                    </AppText>
                  </View>
                );
              })}
            </View>
            <AppButton fullWidth onPress={sendMockReply}>
              {guidedTurns[turnIndex]
                ? `Reply: ${guidedTurns[turnIndex]?.userReply}`
                : 'Continue'}
            </AppButton>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
