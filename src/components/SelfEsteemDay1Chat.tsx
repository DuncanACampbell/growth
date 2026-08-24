import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import {
  getSelfEsteemExerciseOpening,
  isFirebaseConfigured,
  sendSelfEsteemMessage,
  type SendSelfEsteemMessageResult,
} from '@/lib/firebase';
import { useTheme } from '@/theme';
import type { ChallengeMessage, ProgrammeMemoryRecord } from '@/types/models';

type SelfEsteemDay1ChatProps = {
  sessionId: string;
  themeId: string;
  exerciseId: string;
  previousMemory?: ProgrammeMemoryRecord[];
  onComplete?: (
    finalStatement: string | null,
    memory: SendSelfEsteemMessageResult['memory'],
  ) => void;
};

function toLlmHistory(messages: ChallengeMessage[]) {
  return messages.map((message) => ({
    role: (message.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    text: message.text,
  }));
}

export function SelfEsteemDay1Chat({
  sessionId,
  themeId,
  exerciseId,
  previousMemory = [],
  onComplete,
}: SelfEsteemDay1ChatProps) {
  const theme = useTheme();
  const [messages, setMessages] = useState<ChallengeMessage[]>([]);
  const [loadingOpening, setLoadingOpening] = useState(true);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [finalStatement, setFinalStatement] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const didPersistCompletion = useRef(false);

  const ready = messages.length > 0 && !loadingOpening;
  const userReplyCount = messages.filter((message) => message.role === 'user')
    .length;
  const atTurnLimit = userReplyCount >= 9;
  const conversationClosed = sessionComplete || atTurnLimit;
  const canSend =
    ready && !conversationClosed && draft.trim().length > 0 && !sending;

  async function loadOpening() {
    if (!isFirebaseConfigured()) {
      setError(
        'Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_* values to .env.',
      );
      setLoadingOpening(false);
      return;
    }

    setLoadingOpening(true);
    setError(null);
    try {
      const { opening } = await getSelfEsteemExerciseOpening({
        themeId,
        exerciseId,
      });
      setMessages([{ id: 'opening', role: 'guide', text: opening }]);
    } catch (caught) {
      setMessages([]);
      setError(
        caught instanceof Error ? caught.message : 'Could not load today’s opening.',
      );
    } finally {
      setLoadingOpening(false);
    }
  }

  useEffect(() => {
    void loadOpening();
  }, [themeId, exerciseId]);

  async function send() {
    const text = draft.trim();
    if (!text || sending || !ready || conversationClosed) {
      return;
    }

    const history = toLlmHistory(messages);
    const userMessage: ChallengeMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text,
    };

    setDraft('');
    setError(null);
    setSending(true);
    setMessages((current) => [...current, userMessage]);

    try {
      const { reply, isComplete, finalStatement: statement, memory } =
        await sendSelfEsteemMessage({
          message: text,
          themeId,
          exerciseId,
          sessionId,
          history,
          previousMemory,
        });
      setMessages((current) => [
        ...current,
        { id: `guide-${Date.now()}`, role: 'guide', text: reply },
      ]);
      if (isComplete) {
        setSessionComplete(true);
        setFinalStatement(statement);
        if (!didPersistCompletion.current) {
          didPersistCompletion.current = true;
          onComplete?.(statement, memory);
        }
      }
    } catch (caught) {
      const message =
        caught instanceof Error ? caught.message : 'Could not reach the backend.';
      setError(message);
      setDraft(text);
      setMessages((current) =>
        current.filter((item) => item.id !== userMessage.id),
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <View style={styles.column}>
      <ScrollView
        contentContainerStyle={{
          gap: theme.spacing.md,
          paddingBottom: theme.spacing.md,
        }}
      >
        {loadingOpening ? (
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing.sm }}>
            <ActivityIndicator color={theme.colors.primary} />
            <AppText variant="caption" tone="muted">
              Loading…
            </AppText>
          </View>
        ) : null}
        {messages.map((message) => (
          <View
            key={message.id}
            style={{
              alignSelf: message.role === 'user' ? 'flex-end' : 'flex-start',
              backgroundColor:
                message.role === 'user' ? theme.colors.primary : theme.colors.surface,
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
        {sending ? (
          <View style={{ alignItems: 'center', flexDirection: 'row', gap: theme.spacing.sm }}>
            <ActivityIndicator color={theme.colors.primary} />
            <AppText variant="caption" tone="muted">
              Sending…
            </AppText>
          </View>
        ) : null}
      </ScrollView>

      {error ? (
        <AppText variant="caption" tone="danger">
          {error}
        </AppText>
      ) : null}

      {!ready && !loadingOpening ? (
        <Pressable
          accessibilityRole="button"
          onPress={() => {
            void loadOpening();
          }}
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
            Try again
          </AppText>
        </Pressable>
      ) : conversationClosed ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            finalStatement
              ? `Back to Home. Today's thought: ${finalStatement}`
              : 'Back to Home'
          }
          onPress={() => {
            router.replace('/home');
          }}
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
            Back to Home
          </AppText>
        </Pressable>
      ) : (
        <View style={{ gap: theme.spacing.sm }}>
          <TextInput
            value={draft}
            onChangeText={setDraft}
            editable={!sending && ready}
            placeholder="Write a reply"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            style={{
              borderColor: theme.colors.border,
              borderRadius: theme.radii.md,
              borderWidth: 1,
              color: theme.colors.text,
              minHeight: 48,
              padding: theme.spacing.md,
            }}
          />
          <Pressable
            accessibilityRole="button"
            disabled={!canSend}
            onPress={() => {
              void send();
            }}
            style={[
              styles.button,
              {
                backgroundColor: canSend ? theme.colors.primary : theme.colors.surface,
                borderRadius: theme.radii.md,
                opacity: canSend ? 1 : 0.6,
                padding: theme.spacing.md,
              },
            ]}
          >
            <AppText variant="body" tone={canSend ? 'onPrimary' : 'muted'}>
              {sending ? 'Sending…' : error ? 'Try again' : 'Send'}
            </AppText>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
  },
  column: {
    flex: 1,
    gap: 16,
  },
});
