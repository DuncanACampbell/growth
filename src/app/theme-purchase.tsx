import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import {
  THEME_BUNDLE_PRICE_EUR,
  THEME_SINGLE_PRICE_EUR,
  formatEuroPrice,
  getCatalogTheme,
  remainingCreditsLabel,
} from '@/data/mock';
import { getThemeCredits, getThemeProgress } from '@/data/progression';
import { useMockSession } from '@/lib/mock-session';
import { useTheme } from '@/theme';

export default function ThemePurchaseScreen() {
  const theme = useTheme();
  const {
    isSignedIn,
    world,
    unlockThemeWithSinglePurchase,
    unlockThemeWithBundlePurchase,
    unlockThemeWithCredit,
  } = useMockSession();
  const { themeId: themeIdParam } = useLocalSearchParams<{ themeId?: string }>();
  const themeId = typeof themeIdParam === 'string' ? themeIdParam : null;
  const catalogTheme = getCatalogTheme(themeId);

  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }

  if (!catalogTheme || catalogTheme.status === 'comingSoon') {
    return <Redirect href="/home" />;
  }

  const selectedTheme = catalogTheme;
  const alreadyOwned = Boolean(getThemeProgress(world, selectedTheme.id));
  const credits = getThemeCredits(world);

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/home');
  }

  function afterUnlock() {
    router.replace('/home');
  }

  function purchaseSingle() {
    if (!alreadyOwned) {
      unlockThemeWithSinglePurchase(selectedTheme.id);
    }
    afterUnlock();
  }

  function purchaseBundle() {
    if (!alreadyOwned) {
      unlockThemeWithBundlePurchase(selectedTheme.id);
    }
    afterUnlock();
  }

  function purchaseWithCredit() {
    if (!alreadyOwned) {
      unlockThemeWithCredit(selectedTheme.id);
    }
    afterUnlock();
  }

  return (
    <Screen>
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'space-between',
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.lg,
          gap: theme.spacing.xl,
        }}
      >
        <View style={{ gap: theme.spacing.lg }}>
          <Pressable accessibilityRole="button" onPress={goBack}>
            <AppText variant="body" tone="primary">
              Back
            </AppText>
          </Pressable>

          <View style={{ gap: theme.spacing.sm }}>
            <AppText variant="title">{catalogTheme.name}</AppText>
            <AppText variant="body" tone="muted">
              {catalogTheme.description}
            </AppText>
          </View>

          <AppText variant="body">{catalogTheme.longDescription}</AppText>

          {catalogTheme.outcomes.length > 0 ? (
            <View style={{ gap: theme.spacing.sm }}>
              <AppText variant="subtitle">What you may develop</AppText>
              {catalogTheme.outcomes.map((outcome) => (
                <AppText key={outcome} variant="body">
                  • {outcome}
                </AppText>
              ))}
            </View>
          ) : null}
        </View>

        <View style={{ gap: theme.spacing.md }}>
          {alreadyOwned ? (
            <Pressable
              accessibilityRole="button"
              onPress={afterUnlock}
              style={[
                styles.button,
                {
                  backgroundColor: theme.colors.primary,
                  borderRadius: theme.radii.md,
                  padding: theme.spacing.md,
                },
              ]}
            >
              <AppText variant="body" tone="onPrimary">
                Continue
              </AppText>
            </Pressable>
          ) : credits > 0 ? (
            <View style={{ gap: theme.spacing.xs }}>
              <Pressable
                accessibilityRole="button"
                onPress={purchaseWithCredit}
                style={[
                  styles.button,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radii.md,
                    padding: theme.spacing.md,
                  },
                ]}
              >
                <AppText variant="body" tone="onPrimary">
                  Purchase with one credit
                </AppText>
              </Pressable>
              <AppText variant="caption" tone="muted">
                {remainingCreditsLabel(credits)}
              </AppText>
            </View>
          ) : (
            <View style={{ gap: theme.spacing.sm }}>
              <Pressable
                accessibilityRole="button"
                onPress={purchaseSingle}
                style={[
                  styles.button,
                  {
                    backgroundColor: theme.colors.primary,
                    borderRadius: theme.radii.md,
                    padding: theme.spacing.md,
                  },
                ]}
              >
                <AppText variant="body" tone="onPrimary">
                  Unlock this theme for {formatEuroPrice(THEME_SINGLE_PRICE_EUR)}
                </AppText>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={purchaseBundle}
                style={[
                  styles.button,
                  {
                    borderColor: theme.colors.border,
                    borderRadius: theme.radii.md,
                    borderWidth: 1,
                    padding: theme.spacing.md,
                  },
                ]}
              >
                <AppText variant="body">
                  Unlock 3 themes for {formatEuroPrice(THEME_BUNDLE_PRICE_EUR)}
                </AppText>
              </Pressable>
            </View>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
  },
});
