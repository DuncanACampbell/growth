import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import type { CatalogThemeVisual } from '@/data/theme-visuals';
import {
  getGuidedExerciseOpening,
  isFirebaseConfigured,
  sendGuidedExerciseMessage,
  toUserFacingGuideError,
  type SendGuidedExerciseMessageResult,
} from '@/lib/firebase';
import { displayStatement } from '@/lib/display-statement';
import { logTechnicalError } from '@/lib/errors/user-facing';
import { useToast } from '@/lib/toast';
import { useTheme } from '@/theme';
import { appFonts } from '@/theme/fonts';
import type { ChallengeMessage, ProgrammeMemoryRecord } from '@/types/models';

type GuidedExerciseChatProps = {
  sessionId: string;
  themeId: string;
  exerciseId: string;
  visual: CatalogThemeVisual;
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
  visual,
  previousMemory = [],
  initialMessages = [],
  onHistorySave,
  onComplete,
}: GuidedExerciseChatProps) {
  const theme = useTheme();
  const { showErrorToast } = useToast();
  const restored = initialMessages.length > 0;
  const [messages, setMessages] = useState<ChallengeMessage[]>(
    restored ? initialMessages : [],
  );
  const [loadingOpening, setLoadingOpening] = useState(!restored);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [finalStatement, setFinalStatement] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const didPersistCompletion = useRef(false);
  const skipOpeningFetch = useRef(restored);
  const sendLockRef = useRef(false);
  const requestGenerationRef = useRef(0);
  const scrollRef = useRef<ScrollView>(null);
  const pendingScrollGuideId = useRef<string | null>(null);

  const ready = messages.length > 0 && !loadingOpening;
  const userReplyCount = messages.filter((message) => message.role === 'user')
    .length;
  const atTurnLimit = userReplyCount >= 9;
  const conversationClosed = sessionComplete || atTurnLimit;
  const canSend =
    ready && !conversationClosed && draft.trim().length > 0 && !sending;
  const takeaway = finalStatement ? displayStatement(finalStatement) : '';

  useEffect(() => {
    return () => {
      requestGenerationRef.current += 1;
    };
  }, []);

  async function loadOpening() {
    if (!isFirebaseConfigured()) {
      const technicalError = new Error(
        'Firebase is not configured on this client.',
      );
      logTechnicalError('guide.opening', technicalError);
      showErrorToast({
        message: toUserFacingGuideError(technicalError, 'opening'),
        technicalError,
      });
      setLoadingOpening(false);
      return;
    }

    setLoadingOpening(true);
    try {
      const { opening } = await getGuidedExerciseOpening({
        themeId,
        exerciseId,
      });
      const openingMessage: ChallengeMessage = {
        id: 'opening',
        role: 'guide',
        text: opening,
      };
      pendingScrollGuideId.current = openingMessage.id;
      setMessages([openingMessage]);
      onHistorySave?.([openingMessage]);
    } catch (caught) {
      logTechnicalError('guide.opening', caught);
      setMessages([]);
      showErrorToast({
        message: toUserFacingGuideError(caught, 'opening'),
        technicalError: caught,
      });
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
      pendingScrollGuideId.current = assistantMessage.id;
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
      logTechnicalError('guide.send', caught);
      showErrorToast({
        message: toUserFacingGuideError(caught, 'send'),
        technicalError: caught,
      });
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

  function scrollGuideIntoView(y: number) {
    const targetY = Math.max(0, y - theme.spacing.md);
    scrollRef.current?.scrollTo({ y: targetY, animated: true });
  }

  /** Vertical gap before a turn: larger after a user reply into the next guide. */
  function turnSpacing(index: number, role: ChallengeMessage['role']): number {
    if (index === 0) {
      return 0;
    }
    const previous = messages[index - 1];
    if (previous?.role === 'user' && role === 'guide') {
      return theme.spacing.xxxl + theme.spacing.md;
    }
    if (previous?.role === 'guide' && role === 'user') {
      return theme.spacing.xl;
    }
    return theme.spacing.xl;
  }

  function guideParagraphs(text: string): string[] {
    const blocks = text
      .split(/\n\s*\n/)
      .map((part) => part.trim())
      .filter(Boolean);
    return blocks.length > 0 ? blocks : [text.trim()].filter(Boolean);
  }

  return (
    <View style={styles.column}>
      <ScrollView
        ref={scrollRef}
        style={styles.fill}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: theme.spacing.xxl,
          paddingTop: theme.spacing.xxxl + theme.spacing.md,
        }}
      >
        {loadingOpening ? (
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: theme.spacing.sm,
            }}
          >
            <ActivityIndicator color={visual.accent} />
            <AppText variant="caption" tone="muted">
              Loading…
            </AppText>
          </View>
        ) : null}

        {messages.map((message, index) => {
          const marginTop = turnSpacing(index, message.role);

          if (message.role === 'user') {
            return (
              <View
                key={message.id}
                accessibilityLabel={`Your reply: ${message.text}`}
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
            );
          }

          const paragraphs = guideParagraphs(message.text);

          return (
            <View
              key={message.id}
              accessibilityLabel={`Guide: ${message.text}`}
              onLayout={(event) => {
                if (pendingScrollGuideId.current !== message.id) {
                  return;
                }
                pendingScrollGuideId.current = null;
                scrollGuideIntoView(event.nativeEvent.layout.y);
              }}
              style={{
                alignSelf: 'flex-start',
                gap: theme.spacing.sm,
                marginTop,
                maxWidth: '78%',
                width: '78%',
              }}
            >
              {paragraphs.map((paragraph, paragraphIndex) => (
                <AppText
                  key={`${message.id}-p-${paragraphIndex}`}
                  variant="body"
                  style={{
                    color: theme.colors.text,
                    fontSize: 17,
                    letterSpacing: -0.15,
                    lineHeight: 25,
                  }}
                >
                  {paragraph}
                </AppText>
              ))}
            </View>
          );
        })}

        {sending ? (
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: theme.spacing.sm,
              marginTop: theme.spacing.xl,
            }}
          >
            <ActivityIndicator color={visual.accent} />
            <AppText variant="caption" tone="muted">
              Thinking…
            </AppText>
          </View>
        ) : null}

        {conversationClosed && takeaway ? (
          <View
            style={{
              backgroundColor: visual.tint,
              borderRadius: theme.radii.xxl,
              gap: theme.spacing.xl,
              marginTop: theme.spacing.xxxl + theme.spacing.md,
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
              {takeaway}
            </AppText>
            <AppButton
              fullWidth
              accessibilityLabel={`Back to Home. Today's thought: ${takeaway}`}
              onPress={() => {
                router.replace('/home');
              }}
            >
              Back to Home
            </AppButton>
          </View>
        ) : conversationClosed ? (
          <View style={{ marginTop: theme.spacing.xxxl }}>
            <AppButton
              fullWidth
              accessibilityLabel="Back to Home"
              onPress={() => {
                router.replace('/home');
              }}
            >
              Back to Home
            </AppButton>
          </View>
        ) : null}
      </ScrollView>

      {!ready && !loadingOpening ? (
        <AppButton
          fullWidth
          onPress={() => {
            void loadOpening();
          }}
        >
          Try again
        </AppButton>
      ) : conversationClosed ? null : (
        <View
          style={{
            alignItems: 'flex-end',
            backgroundColor: theme.colors.surface,
            borderRadius: theme.radii.xxl,
            flexDirection: 'row',
            gap: theme.spacing.sm,
            minHeight: 56,
            paddingLeft: theme.spacing.lg,
            paddingRight: theme.spacing.sm,
            paddingVertical: theme.spacing.sm,
          }}
        >
          <TextInput
            value={draft}
            onChangeText={setDraft}
            editable={!sending && ready}
            placeholder="Write a reply…"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            accessibilityLabel="Write a reply"
            underlineColorAndroid="transparent"
            selectionColor={theme.colors.textMuted}
            onFocus={() => {
              requestAnimationFrame(() => {
                scrollRef.current?.scrollToEnd({ animated: true });
              });
            }}
            style={[
              {
                borderWidth: 0,
                color: theme.colors.text,
                flex: 1,
                fontFamily: appFonts.regular,
                fontSize: theme.typography.body.fontSize,
                lineHeight: theme.typography.body.lineHeight,
                maxHeight: 120,
                minHeight: 40,
                paddingVertical: theme.spacing.sm,
              },
              Platform.OS === 'web'
                ? ({
                    outlineStyle: 'none',
                    outlineWidth: 0,
                  } as unknown as TextStyle)
                : null,
            ]}
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Send reply"
            accessibilityState={{ disabled: !canSend }}
            disabled={!canSend}
            onPress={() => {
              void send();
            }}
            style={{
              alignItems: 'center',
              backgroundColor: canSend
                ? theme.colors.buttonPrimary
                : theme.colors.border,
              borderRadius: theme.radii.full,
              height: 44,
              justifyContent: 'center',
              opacity: canSend ? 1 : 0.55,
              width: 44,
            }}
          >
            <Ionicons
              name="send"
              size={18}
              color={
                canSend
                  ? theme.colors.buttonOnPrimary
                  : theme.colors.textMuted
              }
            />
          </Pressable>
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
  fill: {
    flex: 1,
  },
});
