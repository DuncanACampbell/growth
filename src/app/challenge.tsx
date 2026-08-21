import { Redirect, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import {
  getHomeState,
  getTodaysChallenge,
  getTodaysStatement,
  MOCK_CHALLENGE_TURNS,
  MOCK_STATEMENT_TEXT,
} from '@/data/mock';
import { useMockSession } from '@/lib/mock-session';
import { useTheme } from '@/theme';
import type { ChallengeMessage } from '@/types/models';

export default function ChallengeScreen() {
  const theme = useTheme();
  const { isSignedIn, world, completeToday } = useMockSession();
  const [turnIndex, setTurnIndex] = useState(0);
  const [awaitingReply, setAwaitingReply] = useState(true);

  const todaysChallenge = world
    ? getTodaysChallenge(world, world.user.selectedThemeId)
    : null;
  const alreadyComplete = world ? getHomeState(world) === 'challenge_complete' : false;
  const todaysStatement = world
    ? getTodaysStatement(world, todaysChallenge?.id ?? null)
    : null;

  const liveMessages = useMemo(() => {
    const messages: ChallengeMessage[] = [];
    for (let index = 0; index < turnIndex; index += 1) {
      const turn = MOCK_CHALLENGE_TURNS[index];
      if (!turn) {
        continue;
      }
      messages.push({
        id: `guide-${index}`,
        role: 'guide',
        text: turn.guideText,
      });
      messages.push({
        id: `user-${index}`,
        role: 'user',
        text: turn.userReply,
      });
    }
    const current = MOCK_CHALLENGE_TURNS[turnIndex];
    if (current) {
      messages.push({
        id: `guide-${turnIndex}`,
        role: 'guide',
        text: current.guideText,
      });
      if (!awaitingReply) {
        messages.push({
          id: `user-${turnIndex}`,
          role: 'user',
          text: current.userReply,
        });
      }
    }
    return messages;
  }, [turnIndex, awaitingReply]);

  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }

  if (!todaysChallenge || getHomeState(world) === 'new') {
    return <Redirect href="/home" />;
  }

  const showCompletion = alreadyComplete;

  function sendMockReply() {
    const current = MOCK_CHALLENGE_TURNS[turnIndex];
    if (!current) {
      return;
    }

    setAwaitingReply(false);

    const isLastTurn = turnIndex >= MOCK_CHALLENGE_TURNS.length - 1;
    if (isLastTurn) {
      completeToday();
      return;
    }

    setTurnIndex((index) => index + 1);
    setAwaitingReply(true);
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
          {showCompletion ? 'Today’s statement' : 'Today’s challenge'}
        </AppText>
        <AppText variant="body" tone="muted">
          {todaysChallenge.title}
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
              Statement of the day
            </AppText>
            <AppText variant="subtitle">
              {todaysStatement?.text ?? MOCK_STATEMENT_TEXT}
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
              {MOCK_CHALLENGE_TURNS[turnIndex]
                ? `Reply: ${MOCK_CHALLENGE_TURNS[turnIndex]?.userReply}`
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
});
