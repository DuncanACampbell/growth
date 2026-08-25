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

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { GuidedExerciseChat } from '@/components/GuidedExerciseChat';
import { getExampleStatement, getGuidedTurns, getProgrammeForTheme } from '@/data/mock';
import {
  developerCompleteOptions,
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
import { useMockSession } from '@/lib/mock-session';
import { useTheme } from '@/theme';
import type { ChallengeMessage } from '@/types/models';

export default function ChallengeScreen() {
  const theme = useTheme();
  const { isSignedIn, world, completeToday, saveInProgressSession } = useMockSession();
  const { themeId: themeIdParam, exerciseId: exerciseIdParam } = useLocalSearchParams<{
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

  function markCompleteForTesting() {
    if (!themeId || !todaysChallenge) {
      return;
    }
    const placeholderClose: ChallengeMessage = {
      id: `dev-complete-${Date.now()}`,
      role: 'guide',
      text: 'That’s it for today. Come back tomorrow.',
    };
    const messages = [...(inProgress?.messages ?? []), placeholderClose];
    completeToday(
      themeId,
      developerCompleteOptions(themeId, todaysChallenge.id, messages),
    );
  }

  if (useLiveGuidedChat && (canStart || keepLiveChat)) {
    return (
      <Screen>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.fill}
        >
          <View
            style={{
              gap: theme.spacing.lg,
              paddingHorizontal: theme.spacing.xl,
              paddingTop: theme.spacing.lg,
            }}
          >
            <AppText variant="title">{todaysChallenge.title}</AppText>
            <AppText variant="body" tone="muted">
              {todaysChallenge.prompt}
            </AppText>
          </View>
          <View
            style={[
              styles.fill,
              {
                paddingHorizontal: theme.spacing.xl,
                paddingVertical: theme.spacing.lg,
              },
            ]}
          >
            <GuidedExerciseChat
              sessionId={inProgress?.id ?? todaysChallenge.id}
              themeId={themeId}
              exerciseId={todaysChallenge.id}
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
            <Pressable
              accessibilityRole="button"
              onPress={markCompleteForTesting}
              style={{ alignItems: 'center', paddingVertical: theme.spacing.sm }}
            >
              <AppText variant="caption" tone="muted">
                Developer
              </AppText>
              <AppText variant="body" tone="primary">
                Mark conversation complete
              </AppText>
            </Pressable>
          </View>
        </KeyboardAvoidingView>
      </Screen>
    );
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.lg,
          gap: theme.spacing.lg,
        }}
      >
        <AppText variant="title">
          {showCompletion ? 'Today’s notice' : todaysChallenge.title}
        </AppText>
        <AppText variant="body" tone="muted">
          {todaysChallenge.prompt}
        </AppText>

        {showCompletion ? (
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
              Today’s notice
            </AppText>
            <AppText variant="subtitle">
              {todaysStatement?.text ??
                getExampleStatement(todaysChallenge.id) ??
                todaysChallenge.title}
            </AppText>
          </View>
        ) : (
          <View style={{ gap: theme.spacing.md }}>
            {liveMessages.map((message) => (
              <View
                key={message.id}
                style={{
                  alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
                  backgroundColor:
                    message.role === 'user'
                      ? theme.colors.primary
                      : theme.colors.surface,
                  borderColor: theme.colors.border,
                  borderRadius: theme.radii.md,
                  borderWidth: 1,
                  maxWidth: '85%',
                  padding: theme.spacing.md,
                }}
              >
                <AppText
                  variant="caption"
                  tone={message.role === 'user' ? 'onPrimary' : 'muted'}
                >
                  {message.role === 'guide' ? 'Guide' : 'You'}
                </AppText>
                <AppText
                  variant="body"
                  tone={message.role === 'user' ? 'onPrimary' : 'default'}
                >
                  {message.text}
                </AppText>
              </View>
            ))}
          </View>
        )}

        {showCompletion ? (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.replace('/home')}
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
              Back to home
            </AppText>
          </Pressable>
        ) : (
          <Pressable
            accessibilityRole="button"
            onPress={sendMockReply}
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
              {guidedTurns[turnIndex]
                ? `Reply: ${guidedTurns[turnIndex]?.userReply}`
                : 'Continue'}
            </AppText>
          </Pressable>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
  },
  fill: {
    flex: 1,
  },
});
