import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
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
import { SelfEsteemDay1Chat } from '@/components/SelfEsteemDay1Chat';
import { getExampleStatement, getGuidedTurns } from '@/data/mock';
import { SELF_ESTEEM_PROGRAMME } from '@/data/programmes/self-esteem';
import {
  didCompleteThemeToday,
  getHomeState,
  getTodaysChallenge,
  getTodaysStatement,
} from '@/data/progression';
import { useMockSession } from '@/lib/mock-session';
import { useTheme } from '@/theme';
import type { ChallengeMessage } from '@/types/models';

export default function ChallengeScreen() {
  const theme = useTheme();
  const { isSignedIn, world, completeToday } = useMockSession();
  const { themeId: themeIdParam } = useLocalSearchParams<{ themeId?: string }>();
  const [turnIndex, setTurnIndex] = useState(0);
  const [awaitingReply, setAwaitingReply] = useState(true);
  const [keepLiveChat, setKeepLiveChat] = useState(false);

  const themeId =
    (typeof themeIdParam === 'string' && themeIdParam.length > 0
      ? themeIdParam
      : world?.user.selectedThemeId) ?? null;
  const todaysChallenge = world ? getTodaysChallenge(world, themeId) : null;
  const alreadyComplete = world && themeId ? didCompleteThemeToday(world, themeId) : false;
  const todaysStatement = world
    ? getTodaysStatement(world, todaysChallenge?.id ?? null)
    : null;

  const guidedTurns = getGuidedTurns(todaysChallenge?.id);

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

  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }

  if (!todaysChallenge || getHomeState(world) === 'new') {
    return <Redirect href="/home" />;
  }

  const showCompletion = alreadyComplete;
  const isSelfEsteemExercise =
    typeof todaysChallenge.id === 'string' &&
    todaysChallenge.id.startsWith('self-esteem-');

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

  if (isSelfEsteemExercise && (!showCompletion || keepLiveChat)) {
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
            <SelfEsteemDay1Chat
              sessionId={todaysChallenge.id}
              themeId={SELF_ESTEEM_PROGRAMME.id}
              exerciseId={todaysChallenge.id}
              onComplete={(statement) => {
                setKeepLiveChat(true);
                completeToday(themeId ?? undefined, { finalStatement: statement });
              }}
            />
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
