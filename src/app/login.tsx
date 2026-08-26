import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { useAuthSession } from '@/lib/auth-session';
import { getPostAuthHref } from '@/lib/onboarding';
import { useMockSession } from '@/lib/mock-session';
import { useTheme } from '@/theme';
import { appFonts } from '@/theme/fonts';

function toAuthErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
}

function randomDevEmailLocalPart(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let local = '';
  for (let i = 0; i < 12; i += 1) {
    local += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return local;
}

export default function LoginScreen() {
  const theme = useTheme();
  const {
    signIn: authSignIn,
    signUp: authSignUp,
  } = useAuthSession();
  const {
    isSignedIn,
    world,
    signIn: mockSignIn,
    signUp: mockSignUp,
  } = useMockSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (isSignedIn && world) {
    return <Redirect href={getPostAuthHref(world)} />;
  }

  function fillDevCredentials() {
    setEmail(`${randomDevEmailLocalPart()}@rally.lgbt`);
    setPassword('12345678');
    setError(null);
  }

  async function handleSignUp() {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await authSignUp(email.trim(), password);
      mockSignUp();
      router.replace('/onboarding/name');
    } catch (caught) {
      setError(toAuthErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogIn() {
    if (submitting) {
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await authSignIn(email.trim(), password);
      mockSignIn('incomplete');
      router.replace('/home');
    } catch (caught) {
      setError(toAuthErrorMessage(caught));
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle: TextStyle = {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: 'rgba(255,255,255,0.34)',
    borderRadius: theme.radii.full,
    borderWidth: 1,
    color: '#FFFFFF',
    fontFamily: appFonts.regular,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    minHeight: 48,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  };

  return (
    <LinearGradient
      colors={['#D86B6E', '#E88A9A', '#B397E8', '#90B9E9', '#88CBB0']}
      end={{ x: 1, y: 1 }}
      start={{ x: 0.05, y: 0 }}
      style={styles.gradient}
    >
      <StatusBar style="light" />
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={styles.safe}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
          style={styles.safe}
        >
          <ScrollView
            contentContainerStyle={[
              styles.content,
              {
                paddingBottom: theme.spacing.xl,
                paddingHorizontal: theme.spacing.xl,
                paddingTop: theme.spacing.xl,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={{ gap: theme.spacing.lg, marginTop: theme.spacing.xl }}>
              <AppText
                variant="title"
                style={{
                  color: '#FFFFFF',
                  fontSize: 56,
                  fontWeight: '700',
                  letterSpacing: -0.6,
                  lineHeight: 60,
                }}
              >
                growth
              </AppText>
              <AppText
                variant="body"
                style={{
                  color: 'rgba(255,255,255,0.9)',
                  lineHeight: 27,
                  maxWidth: 360,
                }}
              >
                A little time each day to understand yourself, shift unhelpful
                patterns and grow.
              </AppText>
            </View>

            <View
              style={{
                gap: theme.spacing.md,
                marginTop: 'auto',
                paddingTop: theme.spacing.xxl,
              }}
            >
              <TextInput
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!submitting}
                keyboardType="email-address"
                placeholder="Email"
                placeholderTextColor="rgba(255,255,255,0.7)"
                textContentType="emailAddress"
                underlineColorAndroid="transparent"
                style={[
                  inputStyle,
                  Platform.OS === 'web'
                    ? ({
                        outlineStyle: 'none',
                        outlineWidth: 0,
                      } as unknown as TextStyle)
                    : null,
                ]}
              />
              <TextInput
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!submitting}
                placeholder="Password"
                placeholderTextColor="rgba(255,255,255,0.7)"
                secureTextEntry
                textContentType="password"
                underlineColorAndroid="transparent"
                style={[
                  inputStyle,
                  Platform.OS === 'web'
                    ? ({
                        outlineStyle: 'none',
                        outlineWidth: 0,
                      } as unknown as TextStyle)
                    : null,
                ]}
              />

              {error ? (
                <AppText
                  variant="caption"
                  style={{ color: '#FFFFFF', lineHeight: 20 }}
                >
                  {error}
                </AppText>
              ) : null}

              <View style={{ position: 'relative', width: '100%' }}>
                <AppButton
                  fullWidth
                  disabled={submitting}
                  onPress={() => {
                    void handleSignUp();
                  }}
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.42)',
                    borderColor: 'rgba(255,255,255,0.58)',
                    borderWidth: 1,
                  }}
                >
                  Sign up
                </AppButton>
                <Pressable
                  accessibilityLabel="Fill test signup credentials"
                  accessibilityRole="button"
                  disabled={submitting}
                  hitSlop={8}
                  onPress={fillDevCredentials}
                  style={{
                    alignItems: 'center',
                    bottom: 0,
                    justifyContent: 'center',
                    opacity: submitting ? 0.5 : 1,
                    paddingHorizontal: theme.spacing.lg,
                    position: 'absolute',
                    right: 0,
                    top: 0,
                  }}
                >
                  <Ionicons
                    name="hammer-outline"
                    size={18}
                    color="rgba(255,255,255,0.45)"
                  />
                </Pressable>
              </View>
              <AppButton
                fullWidth
                disabled={submitting}
                onPress={() => {
                  void handleLogIn();
                }}
                style={{
                  backgroundColor: 'rgba(255,255,255,0.2)',
                  borderColor: 'rgba(255,255,255,0.34)',
                  borderWidth: 1,
                }}
              >
                Log in
              </AppButton>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safe: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
