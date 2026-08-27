import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';

import { OnboardingShell } from '@/components/onboarding/OnboardingAtmosphere';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import {
  canEditOnboardingName,
  isOnboardingComplete,
  nextOnboardingStepAfterName,
  routeForOnboardingStep,
} from '@/lib/onboarding';
import { useMockSession } from '@/lib/mock-session';
import { growthBrandAccent } from '@/theme/brand';
import { useTheme } from '@/theme';
import { appFonts } from '@/theme/fonts';

export default function OnboardingNameScreen() {
  const theme = useTheme();
  const { isSignedIn, world, completeOnboardingName } = useMockSession();
  const [name, setName] = useState(world?.user.displayName ?? '');
  const [focused, setFocused] = useState(false);

  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }

  if (isOnboardingComplete(world.user)) {
    return <Redirect href="/home" />;
  }

  if (!canEditOnboardingName(world.user)) {
    return <Redirect href={routeForOnboardingStep(world.user.onboardingStep)} />;
  }

  const onboardingStep = world.user.onboardingStep;
  const trimmed = name.trim();
  const canContinue = trimmed.length > 0;

  function handleContinue() {
    if (!canContinue) {
      return;
    }
    const returningToThemes = onboardingStep === 'themes';
    completeOnboardingName(trimmed);
    if (returningToThemes) {
      if (router.canGoBack()) {
        router.back();
        return;
      }
      router.replace('/onboarding/themes');
      return;
    }
    router.push(routeForOnboardingStep(nextOnboardingStepAfterName()));
  }

  const inputStyle: TextStyle = {
    borderBottomColor: focused
      ? growthBrandAccent
      : 'rgba(26, 26, 24, 0.18)',
    borderBottomWidth: 1.5,
    color: theme.colors.text,
    fontFamily: appFonts.medium,
    fontSize: 30,
    letterSpacing: -0.35,
    lineHeight: 38,
    minHeight: 48,
    paddingHorizontal: 0,
    paddingVertical: theme.spacing.sm,
  };

  return (
    <OnboardingShell step="name">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={styles.flex}
      >
        <View
          style={[
            styles.flex,
            {
              paddingBottom: theme.spacing.xl,
              paddingHorizontal: theme.spacing.xl,
              paddingTop: theme.spacing.xxl,
            },
          ]}
        >
          <View style={{ gap: theme.spacing.lg, maxWidth: 420 }}>
            <AppText
              variant="title"
              style={{
                color: theme.colors.text,
                fontSize: 40,
                fontWeight: '700',
                letterSpacing: -0.8,
                lineHeight: 46,
              }}
            >
              What should we call you?
            </AppText>
            <AppText
              variant="body"
              tone="muted"
              style={{
                fontSize: 17,
                lineHeight: 26,
                maxWidth: 340,
              }}
            >
              We’ll use this to make Growth feel a little more personal.
            </AppText>

            <View style={{ marginTop: theme.spacing.xl }}>
              <TextInput
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                autoCorrect={false}
                autoFocus={onboardingStep === 'name'}
                placeholder="Your name"
                placeholderTextColor={theme.colors.textMuted}
                returnKeyType="done"
                textContentType="givenName"
                underlineColorAndroid="transparent"
                onFocus={() => {
                  setFocused(true);
                }}
                onBlur={() => {
                  setFocused(false);
                }}
                onSubmitEditing={() => {
                  handleContinue();
                }}
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
            </View>
          </View>

          <View style={styles.flex} />

          <AppButton
            fullWidth
            disabled={!canContinue}
            onPress={handleContinue}
            style={
              !canContinue
                ? {
                    backgroundColor: 'rgba(28, 25, 22, 0.18)',
                    opacity: 1,
                  }
                : undefined
            }
          >
            Continue
          </AppButton>
        </View>
      </KeyboardAvoidingView>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  flex: {
    backgroundColor: 'transparent',
    flex: 1,
  },
});
