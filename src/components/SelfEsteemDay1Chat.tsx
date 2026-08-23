import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { isFirebaseConfigured, sendSelfEsteemMessage } from '@/lib/firebase';
import { useTheme } from '@/theme';
import type { ChallengeMessage } from '@/types/models';

type SelfEsteemDay1ChatProps = {
  opening: string;
  sessionId: string;
};

export function SelfEsteemDay1Chat({ opening, sessionId }: SelfEsteemDay1ChatProps) {
  const theme = useTheme();
  const [messages, setMessages] = useState<ChallengeMessage[]>([
    { id: 'opening', role: 'guide', text: opening },
  ]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSend = draft.trim().length > 0 && !sending;

  async function send() {
    const text = draft.trim();
    if (!text || sending) {
      return;
    }

    if (!isFirebaseConfigured()) {
      setError(
        'Firebase is not configured. Add EXPO_PUBLIC_FIREBASE_* values to .env.',
      );
      return;
    }

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
      const { reply } = await sendSelfEsteemMessage({
        message: text,
        sessionId,
      });
      setMessages((current) => [
        ...current,
        { id: `guide-${Date.now()}`, role: 'guide', text: reply },
      ]);
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

      <View style={{ gap: theme.spacing.sm }}>
        <TextInput
          value={draft}
          onChangeText={setDraft}
          editable={!sending}
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
