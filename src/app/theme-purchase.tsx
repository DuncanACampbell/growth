import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { formatThemePrice, getCatalogTheme } from '@/data/mock';
import { getThemeProgress } from '@/data/progression';
import { useMockSession } from '@/lib/mock-session';
import { useTheme } from '@/theme';

export default function ThemePurchaseScreen() {
  const theme = useTheme();
  const { isSignedIn, world, purchaseTheme } = useMockSession();
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

  function purchase() {
    if (!alreadyOwned) {
      purchaseTheme(selectedTheme.id);
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
          ) : (
            <Pressable
              accessibilityRole="button"
              onPress={purchase}
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
                Unlock for {formatThemePrice(catalogTheme)}
              </AppText>
            </Pressable>
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
