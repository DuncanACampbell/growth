import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  type TextStyle,
} from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import {
  canEditOnboardingName,
  isOnboardingComplete,
  nextOnboardingStepAfterName,
  routeForOnboardingStep,
} from '@/lib/onboarding';
import { useMockSession } from '@/lib/mock-session';
import { ThemeProvider, useTheme } from '@/theme';
import { appFonts } from '@/theme/fonts';

export default function OnboardingNameScreen() {
  return (
    <ThemeProvider scheme="light">
      <OnboardingNameContent />
    </ThemeProvider>
  );
}

function OnboardingNameContent() {
  const theme = useTheme();
  const { isSignedIn, world, completeOnboardingName } = useMockSession();
  const [name, setName] = useState(world?.user.displayName ?? '');

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
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
    borderRadius: theme.radii.full,
    borderWidth: 1,
    color: theme.colors.text,
    fontFamily: appFonts.regular,
    fontSize: theme.typography.body.fontSize,
    lineHeight: theme.typography.body.lineHeight,
    minHeight: 48,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
        style={styles.flex}
      >
        <ScrollView
          contentContainerStyle={[
            styles.content,
            {
              paddingBottom: theme.spacing.xl,
              paddingHorizontal: theme.spacing.xl,
              paddingTop: theme.spacing.xxxl,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: theme.spacing.md, maxWidth: 400 }}>
            <AppText variant="title">What should we call you?</AppText>
            <AppText variant="body" tone="muted">
              We’ll use this to make Growth feel a little more personal.
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
              value={name}
              onChangeText={setName}
              autoCapitalize="words"
              autoCorrect={false}
              autoFocus={onboardingStep === 'name'}
              placeholder="Your first name"
              placeholderTextColor={theme.colors.textMuted}
              returnKeyType="done"
              textContentType="givenName"
              underlineColorAndroid="transparent"
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
            <AppButton
              fullWidth
              disabled={!canContinue}
              onPress={handleContinue}
            >
              Continue
            </AppButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
  },
});
