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
import {
  getDailyConversationOpening,
  isFirebaseConfigured,
  sendDailyConversationMessage,
  toUserFacingDailyConversationError,
  type DailyConversationMessage,
  type DailyConversationMessageDebug,
  type DailyConversationState,
} from '@/lib/firebase';
import {
  setDailyConversationDebugSnapshot,
  snapshotDailyConversationMessageDebug,
} from '@/lib/daily-conversation-debug';
import { logTechnicalError } from '@/lib/errors/user-facing';
import { useToast } from '@/lib/toast';
import { useTheme } from '@/theme';
import { appFonts } from '@/theme/fonts';

type DailyConversationUiMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  debug?: DailyConversationMessageDebug;
};

export function DailyConversation() {
  const theme = useTheme();
  const { showErrorToast } = useToast();
  const [items, setItems] = useState<DailyConversationUiMessage[]>([]);
  const [conversationState, setConversationState] =
    useState<DailyConversationState | null>(null);
  const [loadingOpening, setLoadingOpening] = useState(true);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const sendLockRef = useRef(false);
  const scrollRef = useRef<ScrollView>(null);

  const ready = items.length > 0 && conversationState !== null && !loadingOpening;
  const isComplete = conversationState?.isComplete === true;
  const finalThought = conversationState?.finalThought?.trim() ?? '';
  const canSend = ready && !isComplete && draft.trim().length > 0 && !sending;

  function scrollToLatest() {
    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    });
  }

  async function loadOpening() {
    if (!isFirebaseConfigured()) {
      const technicalError = new Error(
        'Firebase is not configured on this client.',
      );
      logTechnicalError('dailyConversation.opening', technicalError);
      showErrorToast({
        message: toUserFacingDailyConversationError(technicalError, 'opening'),
        technicalError,
      });
      setLoadingOpening(false);
      return;
    }

    setLoadingOpening(true);
    try {
      const result = await getDailyConversationOpening();
      setConversationState(result.state);
      setItems([
        {
          id: 'opening',
          role: 'assistant',
          content: result.message,
        },
      ]);
    } catch (caught) {
      logTechnicalError('dailyConversation.opening', caught);
      showErrorToast({
        message: toUserFacingDailyConversationError(caught, 'opening'),
        technicalError: caught,
      });
      setItems([]);
      setConversationState(null);
    } finally {
      setLoadingOpening(false);
    }
  }

  useEffect(() => {
    void loadOpening();
  }, []);

  async function send() {
    const text = draft.trim();
    if (
      !text ||
      !conversationState ||
      conversationState.isComplete ||
      sendLockRef.current ||
      sending
    ) {
      return;
    }

    sendLockRef.current = true;
    const userItem: DailyConversationUiMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
    };
    const nextItems = [...items, userItem];
    const payload: DailyConversationMessage[] = nextItems.map((item) => ({
      role: item.role,
      content: item.content,
    }));

    setDraft('');
    setSending(true);
    setItems(nextItems);

    try {
      const result = await sendDailyConversationMessage({
        messages: payload,
        state: conversationState,
      });
      const debug = snapshotDailyConversationMessageDebug({
        assessment: result.state,
        promptContext: result.debug?.promptContext ?? null,
      });
      setConversationState(result.state);
      setItems((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: result.message,
          debug,
        },
      ]);
      scrollToLatest();
    } catch (caught) {
      logTechnicalError('dailyConversation.send', caught);
      showErrorToast({
        message: toUserFacingDailyConversationError(caught, 'send'),
        technicalError: caught,
      });
      setDraft(text);
      setItems((current) => current.filter((item) => item.id !== userItem.id));
    } finally {
      sendLockRef.current = false;
      setSending(false);
    }
  }

  return (
    <View style={styles.column}>
      <ScrollView
        ref={scrollRef}
        style={styles.fill}
        keyboardShouldPersistTaps="handled"
        onContentSizeChange={() => {
          if (isComplete || sending) {
            scrollToLatest();
          }
        }}
        contentContainerStyle={{
          paddingBottom: theme.spacing.xxl,
          paddingTop: theme.spacing.lg,
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
            <ActivityIndicator color={theme.colors.textMuted} />
            <AppText variant="caption" tone="muted">
              Loading…
            </AppText>
          </View>
        ) : null}

        {items.map((item, index) => (
          <View
            key={item.id}
            accessibilityLabel={
              item.role === 'user' ? `You: ${item.content}` : item.content
            }
            style={{
              marginTop: index === 0 ? 0 : theme.spacing.xl,
              maxWidth: item.role === 'user' ? '86%' : '100%',
            }}
          >
            <AppText
              variant="body"
              style={{
                color: theme.colors.text,
                fontSize: 17,
                letterSpacing: -0.15,
                lineHeight: 25,
                opacity: item.role === 'user' ? 0.72 : 1,
              }}
            >
              {item.content}
            </AppText>
            {item.role === 'assistant' && item.debug ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Inspect conversation assessment"
                hitSlop={8}
                onPress={() => {
                  if (!item.debug) {
                    return;
                  }
                  setDailyConversationDebugSnapshot(item.debug);
                  router.push('/daily-conversation-debug');
                }}
                style={{
                  alignItems: 'center',
                  height: 40,
                  justifyContent: 'center',
                  marginLeft: -8,
                  marginTop: theme.spacing.xs,
                  opacity: 0.42,
                  width: 40,
                }}
              >
                <Ionicons
                  name="options-outline"
                  size={16}
                  color={theme.colors.textMuted}
                />
              </Pressable>
            ) : null}
          </View>
        ))}

        {sending ? (
          <View
            style={{
              alignItems: 'center',
              flexDirection: 'row',
              gap: theme.spacing.sm,
              marginTop: theme.spacing.xl,
            }}
          >
            <ActivityIndicator color={theme.colors.textMuted} />
            <AppText variant="caption" tone="muted">
              Thinking…
            </AppText>
          </View>
        ) : null}

        {isComplete && !sending ? (
          <View
            style={{
              backgroundColor: '#EFE7DD',
              borderRadius: theme.radii.xxl,
              gap: theme.spacing.md,
              marginTop: theme.spacing.xxl,
              paddingHorizontal: theme.spacing.xl,
              paddingVertical: theme.spacing.xl,
            }}
          >
            <AppText variant="label" tone="muted">
              Thought for today
            </AppText>
            {finalThought ? (
              <AppText
                variant="subtitle"
                style={{
                  fontSize: 22,
                  letterSpacing: -0.3,
                  lineHeight: 30,
                }}
              >
                {finalThought}
              </AppText>
            ) : null}
            <AppButton
              fullWidth
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                  return;
                }
                router.replace('/home');
              }}
              style={{ marginTop: theme.spacing.sm }}
            >
              Back to home
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
      ) : isComplete ? null : (
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
            placeholder="What’s on your mind?"
            placeholderTextColor={theme.colors.textMuted}
            multiline
            accessibilityLabel="What’s on your mind?"
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
            accessibilityLabel="Send"
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
