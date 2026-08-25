import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import {
  getGuidedExerciseOpening,
  isFirebaseConfigured,
  sendGuidedExerciseMessage,
  toUserFacingGuideError,
  type SendGuidedExerciseMessageResult,
} from '@/lib/firebase';
import { useTheme } from '@/theme';
import { appFonts } from '@/theme/fonts';
import type { ChallengeMessage, ProgrammeMemoryRecord } from '@/types/models';

type GuidedExerciseChatProps = {
  sessionId: string;
  themeId: string;
  exerciseId: string;
  previousMemory?: ProgrammeMemoryRecord[];
  initialMessages?: ChallengeMessage[];
  onHistorySave?: (messages: ChallengeMessage[]) => void;
  onComplete?: (
    finalStatement: string | null,
    memory: SendGuidedExerciseMessageResult['memory'],
    messages: ChallengeMessage[],
  ) => void;
};

function toLlmHistory(messages: ChallengeMessage[]) {
  return messages.map((message) => ({
    role: (message.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
    text: message.text,
  }));
}

export function GuidedExerciseChat({
  sessionId,
  themeId,
  exerciseId,
  previousMemory = [],
  initialMessages = [],
  onHistorySave,
  onComplete,
}: GuidedExerciseChatProps) {
  const theme = useTheme();
  const restored = initialMessages.length > 0;
  const [messages, setMessages] = useState<ChallengeMessage[]>(
    restored ? initialMessages : [],
  );
  const [loadingOpening, setLoadingOpening] = useState(!restored);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [finalStatement, setFinalStatement] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const didPersistCompletion = useRef(false);
  const skipOpeningFetch = useRef(restored);
  const sendLockRef = useRef(false);
  const requestGenerationRef = useRef(0);

  const ready = messages.length > 0 && !loadingOpening;
  const userReplyCount = messages.filter((message) => message.role === 'user')
    .length;
  const atTurnLimit = userReplyCount >= 9;
  const conversationClosed = sessionComplete || atTurnLimit;
  const canSend =
    ready && !conversationClosed && draft.trim().length > 0 && !sending;

  useEffect(() => {
    return () => {
      requestGenerationRef.current += 1;
    };
  }, []);

  async function loadOpening() {
    if (!isFirebaseConfigured()) {
      setError(toUserFacingGuideError(new Error('unavailable'), 'opening'));
      setLoadingOpening(false);
      return;
    }

    setLoadingOpening(true);
    setError(null);
    try {
      const { opening } = await getGuidedExerciseOpening({
        themeId,
        exerciseId,
      });
      setMessages([{ id: 'opening', role: 'guide', text: opening }]);
      onHistorySave?.([{ id: 'opening', role: 'guide', text: opening }]);
    } catch (caught) {
      setMessages([]);
      setError(toUserFacingGuideError(caught, 'opening'));
    } finally {
      setLoadingOpening(false);
    }
  }

  useEffect(() => {
    if (skipOpeningFetch.current) {
      skipOpeningFetch.current = false;
      return;
    }
    void loadOpening();
  }, [themeId, exerciseId]);

  async function send() {
    const text = draft.trim();
    if (!text || sendLockRef.current || sending || !ready || conversationClosed) {
      return;
    }

    sendLockRef.current = true;
    const generation = requestGenerationRef.current;
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
        await sendGuidedExerciseMessage({
          message: text,
          themeId,
          exerciseId,
          sessionId,
          history,
          previousMemory,
        });
      if (generation !== requestGenerationRef.current) {
        return;
      }
      const assistantMessage: ChallengeMessage = {
        id: `guide-${Date.now()}`,
        role: 'guide',
        text: reply,
      };
      const next = [...messages, userMessage, assistantMessage];
      setMessages(next);
      if (isComplete) {
        setSessionComplete(true);
        setFinalStatement(statement);
        if (!didPersistCompletion.current) {
          didPersistCompletion.current = true;
          onComplete?.(statement, memory, next);
        }
      } else {
        onHistorySave?.(next);
      }
    } catch (caught) {
      if (generation !== requestGenerationRef.current) {
        return;
      }
      setError(toUserFacingGuideError(caught, 'send'));
      setDraft(text);
      setMessages((current) =>
        current.filter((item) => item.id !== userMessage.id),
      );
    } finally {
      if (generation === requestGenerationRef.current) {
        sendLockRef.current = false;
        setSending(false);
      }
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
        <AppButton
          fullWidth
          onPress={() => {
            void loadOpening();
          }}
        >
          Try again
        </AppButton>
      ) : conversationClosed ? (
        <AppButton
          fullWidth
          accessibilityLabel={
            finalStatement
              ? `Back to Home. Today's thought: ${finalStatement}`
              : 'Back to Home'
          }
          onPress={() => {
            router.replace('/home');
          }}
        >
          Back to Home
        </AppButton>
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
              fontFamily: appFonts.regular,
              fontSize: theme.typography.body.fontSize,
              lineHeight: theme.typography.body.lineHeight,
              minHeight: 48,
              padding: theme.spacing.md,
            }}
          />
          <AppButton
            fullWidth
            disabled={!canSend}
            onPress={() => {
              void send();
            }}
          >
            {sending ? 'Sending…' : error ? 'Try again' : 'Send'}
          </AppButton>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  column: {
    flex: 1,
    gap: 16,
  },
});
