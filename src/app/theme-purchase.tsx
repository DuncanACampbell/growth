import { Ionicons } from '@expo/vector-icons';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import {
  formatThemePrice,
  getCatalogTheme,
  getThemeDurationDays,
} from '@/data/mock';
import { getCatalogThemeVisual } from '@/data/theme-visuals';
import { getThemeProgress } from '@/data/progression';
import { useMockSession } from '@/lib/mock-session';
import { ThemeProvider, useTheme } from '@/theme';

export default function ThemePurchaseScreen() {
  return (
    <ThemeProvider scheme="light">
      <ThemePurchaseContent />
    </ThemeProvider>
  );
}

function ThemePurchaseContent() {
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
  const visual = getCatalogThemeVisual(selectedTheme.id, 'light');
  const durationDays = getThemeDurationDays(selectedTheme.id);

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
          paddingBottom: theme.spacing.xxxl,
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.md,
          gap: theme.spacing.xxl,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          hitSlop={8}
          onPress={goBack}
          style={{
            alignItems: 'center',
            alignSelf: 'flex-start',
            height: 44,
            justifyContent: 'center',
            width: 44,
          }}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
        </Pressable>

        <View
          style={{
            backgroundColor: visual.tint,
            borderRadius: theme.radii.xxl,
            gap: theme.spacing.md,
            paddingHorizontal: theme.spacing.xl,
            paddingVertical: theme.spacing.xxl,
          }}
        >
          <AppText
            variant="title"
            style={{ color: visual.accent, fontWeight: '700' }}
          >
            {catalogTheme.name}
          </AppText>
          <AppText
            variant="body"
            style={{ color: visual.onTint, lineHeight: 26 }}
          >
            {catalogTheme.description}
          </AppText>
          <AppText
            variant="caption"
            style={{ color: visual.onTint, fontWeight: '500', opacity: 0.72 }}
          >
            {durationDays} days · ~5 min a day
          </AppText>
        </View>

        <AppText
          variant="body"
          style={{ color: theme.colors.text, lineHeight: 26 }}
        >
          {catalogTheme.longDescription}
        </AppText>

        {catalogTheme.outcomes.length > 0 ? (
          <View style={{ gap: theme.spacing.lg }}>
            <AppText variant="subtitle">What you may develop</AppText>
            <View style={{ gap: theme.spacing.md }}>
              {catalogTheme.outcomes.map((outcome) => (
                <View
                  key={outcome}
                  style={{
                    alignItems: 'flex-start',
                    flexDirection: 'row',
                    gap: theme.spacing.md,
                  }}
                >
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={visual.accent}
                    style={{ marginTop: 2 }}
                  />
                  <AppText
                    variant="body"
                    style={{
                      color: theme.colors.text,
                      flex: 1,
                      lineHeight: 24,
                    }}
                  >
                    {outcome}
                  </AppText>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <View style={{ paddingTop: theme.spacing.sm }}>
          {alreadyOwned ? (
            <AppButton fullWidth onPress={afterUnlock}>
              Continue
            </AppButton>
          ) : (
            <AppButton fullWidth onPress={purchase}>
              {`Unlock for ${formatThemePrice(catalogTheme)}`}
            </AppButton>
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}
