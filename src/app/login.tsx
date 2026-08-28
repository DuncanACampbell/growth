import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router, type Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { KeyboardAwareScroll } from '@/components/ui/KeyboardAwareScroll';
import { useAuthSession } from '@/lib/auth-session';
import {
  classifyAuthError,
  logTechnicalError,
  toUserFacingAuthMessage,
  USER_FACING,
} from '@/lib/errors/user-facing';
import { getPostAuthHref } from '@/lib/onboarding';
import { useMockSession } from '@/lib/mock-session';
import { resolveHrefAfterAuth } from '@/lib/pending-circle-invite';
import { useToast } from '@/lib/toast';
import {
  fieldMessage,
  isFieldInvalid,
  validateEmail,
  validatePasswordForSignUp,
  validatePasswordPresent,
  type FieldValidation,
} from '@/lib/validation/auth';
import { growthSignupGradient } from '@/theme/brand';
import { useTheme } from '@/theme';
import { appFonts } from '@/theme/fonts';

/** Soft burgundy that reads on the login gradient while matching `danger`. */
const LOGIN_DANGER = '#6E2F2C';
const LOGIN_DANGER_BORDER = 'rgba(110, 47, 44, 0.72)';
const LOGIN_DANGER_PLACEHOLDER = 'rgba(110, 47, 44, 0.78)';
const LOGIN_HINT = 'rgba(90, 38, 36, 0.88)';

/** Compact in-flow slot under each field so hints never overlap the next control. */
const VALIDATION_SLOT_HEIGHT = 18;

function randomDevEmailLocalPart(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyz';
  let local = '';
  for (let i = 0; i < 12; i += 1) {
    local += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return local;
}

function FieldHint({
  message,
  color,
}: {
  message: string | null;
  color: string;
}) {
  const theme = useTheme();
  const [opacity] = useState(() => new Animated.Value(0));
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!cancelled) {
        setReduceMotion(enabled);
      }
    });
    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      cancelled = true;
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      opacity.setValue(message ? 1 : 0);
      return;
    }
    Animated.timing(opacity, {
      toValue: message ? 1 : 0,
      duration: 160,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [message, opacity, reduceMotion]);

  return (
    <View
      style={{
        height: VALIDATION_SLOT_HEIGHT,
        justifyContent: 'flex-start',
        paddingLeft: theme.spacing.xl,
        paddingTop: 3,
      }}
    >
      <Animated.View style={{ opacity }}>
        {message ? (
          <Text
            numberOfLines={1}
            style={{
              color,
              fontFamily: appFonts.regular,
              fontSize: theme.typography.hint.fontSize,
              lineHeight: theme.typography.hint.lineHeight,
            }}
          >
            {message}
          </Text>
        ) : null}
      </Animated.View>
    </View>
  );
}

export default function LoginScreen() {
  const theme = useTheme();
  const { showErrorToast } = useToast();
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
  const [emailValidation, setEmailValidation] = useState<FieldValidation>({
    kind: 'ok',
  });
  const [passwordValidation, setPasswordValidation] = useState<FieldValidation>({
    kind: 'ok',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [passwordRuleMode, setPasswordRuleMode] = useState<'signIn' | 'signUp'>(
    'signIn',
  );
  const [submitting, setSubmitting] = useState(false);
  const [signedInHref, setSignedInHref] = useState<Href | null>(null);
  const [postAuthHandled, setPostAuthHandled] = useState(false);

  useEffect(() => {
    if (!isSignedIn || !world || postAuthHandled) {
      return;
    }

    let cancelled = false;
    void resolveHrefAfterAuth(getPostAuthHref(world)).then((href) => {
      if (!cancelled) {
        setSignedInHref(href);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, world, postAuthHandled]);

  if (isSignedIn && world) {
    if (postAuthHandled) {
      return null;
    }
    if (!signedInHref) {
      return null;
    }
    return <Redirect href={signedInHref} />;
  }

  function clearErrors() {
    setEmailValidation({ kind: 'ok' });
    setPasswordValidation({ kind: 'ok' });
    setFormError(null);
  }

  function fillDevCredentials() {
    setEmail(`${randomDevEmailLocalPart()}@rally.lgbt`);
    setPassword('12345678');
    clearErrors();
  }

  function handleEmailChange(next: string) {
    setEmail(next);
    setFormError(null);
    if (emailValidation.kind !== 'ok') {
      setEmailValidation(validateEmail(next));
    }
  }

  function handlePasswordChange(next: string) {
    setPassword(next);
    setFormError(null);
    if (passwordValidation.kind !== 'ok') {
      setPasswordValidation(
        passwordRuleMode === 'signUp'
          ? validatePasswordForSignUp(next)
          : validatePasswordPresent(next),
      );
    }
  }

  function handleAuthFailure(caught: unknown, mode: 'signUp' | 'signIn') {
    logTechnicalError(`auth.${mode}`, caught);
    const kind = classifyAuthError(caught);
    const message = toUserFacingAuthMessage(kind, mode);

    if (kind === 'offline' || kind === 'generic') {
      showErrorToast({ message, technicalError: caught });
      return;
    }

    if (kind === 'invalid_email') {
      setEmailValidation({ kind: 'message', message });
      return;
    }

    if (kind === 'weak_password') {
      setPasswordValidation({ kind: 'message', message });
      return;
    }

    if (kind === 'email_in_use') {
      setEmailValidation({
        kind: 'message',
        message: USER_FACING.emailInUse,
      });
      return;
    }

    setFormError(message);
  }

  async function handleSignUp() {
    if (submitting) {
      return;
    }

    const nextEmail = validateEmail(email);
    const nextPassword = validatePasswordForSignUp(password);
    setPasswordRuleMode('signUp');
    setEmailValidation(nextEmail);
    setPasswordValidation(nextPassword);
    setFormError(null);

    if (isFieldInvalid(nextEmail) || isFieldInvalid(nextPassword)) {
      return;
    }

    setSubmitting(true);
    try {
      await authSignUp(email.trim(), password);
      setPostAuthHandled(true);
      mockSignUp();
      const href = await resolveHrefAfterAuth('/onboarding/name');
      router.replace(href);
    } catch (caught) {
      setPostAuthHandled(false);
      handleAuthFailure(caught, 'signUp');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogIn() {
    if (submitting) {
      return;
    }

    const nextEmail = validateEmail(email);
    const nextPassword = validatePasswordPresent(password);
    setPasswordRuleMode('signIn');
    setEmailValidation(nextEmail);
    setPasswordValidation(nextPassword);
    setFormError(null);

    if (isFieldInvalid(nextEmail) || isFieldInvalid(nextPassword)) {
      return;
    }

    setSubmitting(true);
    try {
      await authSignIn(email.trim(), password);
      setPostAuthHandled(true);
      mockSignIn('incomplete');
      const href = await resolveHrefAfterAuth('/home');
      router.replace(href);
    } catch (caught) {
      setPostAuthHandled(false);
      handleAuthFailure(caught, 'signIn');
    } finally {
      setSubmitting(false);
    }
  }

  const emailInvalid = isFieldInvalid(emailValidation);
  const passwordInvalid = isFieldInvalid(passwordValidation);
  const emailRequired = emailValidation.kind === 'required';
  const passwordRequired = passwordValidation.kind === 'required';

  const inputStyle = (hasError: boolean): TextStyle => ({
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderColor: hasError ? LOGIN_DANGER_BORDER : 'rgba(255,255,255,0.34)',
    borderRadius: theme.radii.full,
    borderWidth: 1,
    color: '#FFFFFF',
    fontFamily: appFonts.regular,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    minHeight: 48,
    paddingHorizontal: theme.spacing.xl,
    paddingRight: hasError ? theme.spacing.xxl + 4 : theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  });

  const webInputReset =
    Platform.OS === 'web'
      ? ({
          outlineStyle: 'none',
          outlineWidth: 0,
        } as unknown as TextStyle)
      : null;

  return (
    <LinearGradient
      colors={[...growthSignupGradient]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0.05, y: 0 }}
      style={styles.gradient}
    >
      <StatusBar style="light" />
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={styles.safe}
      >
        <KeyboardAwareScroll
          contentContainerStyle={{
            paddingBottom: theme.spacing.xl,
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.xl,
          }}
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
                gap: theme.spacing.sm,
                marginTop: 'auto',
                paddingTop: theme.spacing.xxl,
              }}
            >
              <View>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    value={email}
                    onChangeText={handleEmailChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!submitting}
                    keyboardType="email-address"
                    placeholder={emailRequired ? 'Email required' : 'Email'}
                    placeholderTextColor={
                      emailRequired
                        ? LOGIN_DANGER_PLACEHOLDER
                        : 'rgba(255,255,255,0.7)'
                    }
                    textContentType="emailAddress"
                    underlineColorAndroid="transparent"
                    style={[inputStyle(emailInvalid), webInputReset]}
                  />
                  {emailInvalid ? (
                    <View
                      pointerEvents="none"
                      style={{
                        bottom: 0,
                        justifyContent: 'center',
                        position: 'absolute',
                        right: theme.spacing.lg,
                        top: 0,
                      }}
                    >
                      <Ionicons
                        name="alert-circle-outline"
                        size={15}
                        color={LOGIN_DANGER}
                      />
                    </View>
                  ) : null}
                </View>
                <FieldHint
                  message={fieldMessage(emailValidation)}
                  color={LOGIN_HINT}
                />
              </View>

              <View>
                <View style={{ position: 'relative' }}>
                  <TextInput
                    value={password}
                    onChangeText={handlePasswordChange}
                    autoCapitalize="none"
                    autoCorrect={false}
                    editable={!submitting}
                    placeholder={
                      passwordRequired ? 'Password required' : 'Password'
                    }
                    placeholderTextColor={
                      passwordRequired
                        ? LOGIN_DANGER_PLACEHOLDER
                        : 'rgba(255,255,255,0.7)'
                    }
                    secureTextEntry
                    textContentType="password"
                    underlineColorAndroid="transparent"
                    style={[inputStyle(passwordInvalid), webInputReset]}
                  />
                  {passwordInvalid ? (
                    <View
                      pointerEvents="none"
                      style={{
                        bottom: 0,
                        justifyContent: 'center',
                        position: 'absolute',
                        right: theme.spacing.lg,
                        top: 0,
                      }}
                    >
                      <Ionicons
                        name="alert-circle-outline"
                        size={15}
                        color={LOGIN_DANGER}
                      />
                    </View>
                  ) : null}
                </View>
                <FieldHint
                  message={fieldMessage(passwordValidation)}
                  color={LOGIN_HINT}
                />
              </View>

              <FieldHint message={formError} color={LOGIN_HINT} />

              <View style={{ gap: theme.spacing.md }}>
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
            </View>
        </KeyboardAwareScroll>
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
});
