import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { getCatalogueThemes } from '@/data/mock';
import {
  isOnboardingComplete,
  routeForOnboardingStep,
} from '@/lib/onboarding';
import { useMockSession } from '@/lib/mock-session';
import { ThemeProvider, useTheme } from '@/theme';

export default function OnboardingThemesScreen() {
  return (
    <ThemeProvider scheme="light">
      <OnboardingThemesContent />
    </ThemeProvider>
  );
}

function OnboardingThemesContent() {
  const theme = useTheme();
  const { isSignedIn, world, completeOnboardingThemes } = useMockSession();
  const catalogueThemes = getCatalogueThemes();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    () => world?.user.interestedThemeIds ?? [],
  );

  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }

  if (isOnboardingComplete(world.user)) {
    return <Redirect href="/home" />;
  }

  if (world.user.onboardingStep !== 'themes') {
    return <Redirect href={routeForOnboardingStep(world.user.onboardingStep)} />;
  }

  const canContinue = selectedIds.length > 0;

  function toggleTheme(themeId: string) {
    setSelectedIds((current) =>
      current.includes(themeId)
        ? current.filter((id) => id !== themeId)
        : [...current, themeId],
    );
  }

  function handleContinue() {
    if (!canContinue) {
      return;
    }
    completeOnboardingThemes(selectedIds);
    router.replace('/home');
  }

  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/onboarding/name');
  }

  return (
    <Screen>
      <View style={styles.flex}>
        <ScrollView
          contentContainerStyle={{
            gap: theme.spacing.xl,
            paddingBottom: theme.spacing.xl,
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.lg,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            hitSlop={12}
            onPress={handleBack}
            style={{ alignSelf: 'flex-start' }}
          >
            <AppText variant="body" tone="muted">
              Back
            </AppText>
          </Pressable>

          <View style={{ gap: theme.spacing.md, maxWidth: 420 }}>
            <AppText variant="title">What would you like to work on?</AppText>
            <AppText variant="body" tone="muted">
              Choose anything that feels important to you right now. You can
              change this later.
            </AppText>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: theme.spacing.sm,
            }}
          >
            {catalogueThemes.map((item) => {
              const selected = selectedIds.includes(item.id);
              return (
                <Pressable
                  key={item.id}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  accessibilityLabel={item.name}
                  onPress={() => {
                    toggleTheme(item.id);
                  }}
                  style={({ pressed }) => ({
                    backgroundColor: selected
                      ? theme.colors.buttonPrimary
                      : theme.colors.surface,
                    borderColor: selected
                      ? theme.colors.buttonPrimary
                      : theme.colors.border,
                    borderRadius: theme.radii.full,
                    borderWidth: 1,
                    opacity: pressed ? 0.88 : 1,
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.md,
                  })}
                >
                  <AppText
                    variant="body"
                    style={{
                      color: selected
                        ? theme.colors.buttonOnPrimary
                        : theme.colors.text,
                    }}
                  >
                    {item.name}
                  </AppText>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>

        <View
          style={{
            borderTopColor: theme.colors.border,
            borderTopWidth: StyleSheet.hairlineWidth,
            paddingBottom: theme.spacing.lg,
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.md,
          }}
        >
          <AppButton
            fullWidth
            disabled={!canContinue}
            onPress={handleContinue}
          >
            Continue
          </AppButton>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
});
