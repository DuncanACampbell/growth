import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { OnboardingShell } from '@/components/onboarding/OnboardingAtmosphere';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { getCatalogueThemes } from '@/data/mock';
import {
  isOnboardingComplete,
  routeForOnboardingStep,
} from '@/lib/onboarding';
import { useMockSession } from '@/lib/mock-session';
import { growthBrandAccent } from '@/theme/brand';
import { useTheme } from '@/theme';

export default function OnboardingThemesScreen() {
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
    <OnboardingShell
      step="themes"
      leading={
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          hitSlop={12}
          onPress={handleBack}
          style={{
            alignItems: 'center',
            height: 40,
            justifyContent: 'center',
            width: 40,
          }}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>
      }
    >
      <View style={styles.flex}>
        <ScrollView
          style={styles.flex}
          contentContainerStyle={{
            backgroundColor: 'transparent',
            flexGrow: 1,
            paddingBottom: theme.spacing.lg,
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.xxl,
          }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ gap: theme.spacing.lg, maxWidth: 420 }}>
            <AppText
              variant="title"
              style={{
                color: theme.colors.text,
                fontSize: 38,
                fontWeight: '700',
                letterSpacing: -0.7,
                lineHeight: 44,
              }}
            >
              What would you like to work on?
            </AppText>
            <AppText
              variant="body"
              tone="muted"
              style={{
                fontSize: 17,
                lineHeight: 26,
                maxWidth: 360,
              }}
            >
              Choose anything that feels important to you right now. You can
              change this later.
            </AppText>
          </View>

          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: theme.spacing.sm,
              marginTop: theme.spacing.xxl,
              paddingBottom: theme.spacing.xl,
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
                    alignItems: 'center',
                    backgroundColor: selected
                      ? growthBrandAccent
                      : 'rgba(255, 255, 255, 0.58)',
                    borderColor: selected
                      ? growthBrandAccent
                      : 'rgba(26, 26, 24, 0.12)',
                    borderRadius: theme.radii.full,
                    borderWidth: 1,
                    flexDirection: 'row',
                    gap: theme.spacing.xs,
                    opacity: pressed ? 0.9 : 1,
                    paddingHorizontal: theme.spacing.lg,
                    paddingVertical: theme.spacing.md,
                    transform: [{ scale: pressed ? 0.98 : 1 }],
                  })}
                >
                  {selected ? (
                    <Ionicons
                      name="checkmark"
                      size={16}
                      color={theme.colors.buttonOnPrimary}
                    />
                  ) : null}
                  <AppText
                    variant="body"
                    style={{
                      color: selected
                        ? theme.colors.buttonOnPrimary
                        : theme.colors.text,
                      fontWeight: selected ? '600' : '400',
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
            backgroundColor: 'transparent',
            paddingBottom: theme.spacing.xl,
            paddingHorizontal: theme.spacing.xl,
            paddingTop: theme.spacing.md,
          }}
        >
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
      </View>
    </OnboardingShell>
  );
}

const styles = StyleSheet.create({
  flex: {
    backgroundColor: 'transparent',
    flex: 1,
  },
});
