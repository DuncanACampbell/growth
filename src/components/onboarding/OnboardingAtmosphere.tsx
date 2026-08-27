import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/AppText';
import {
  growthBrandAccent,
  growthOnboardingGradient,
} from '@/theme/brand';
import { useTheme } from '@/theme';

export type OnboardingProgressStep = 'name' | 'themes';

type OnboardingShellProps = {
  step: OnboardingProgressStep;
  children: ReactNode;
  /** Optional control rendered top-left (e.g. Back). */
  leading?: ReactNode;
};

/**
 * Full-screen coral wash for onboarding.
 * Must be the root of each onboarding screen (not a parent of the Stack),
 * otherwise the native stack paints an opaque scene over the gradient.
 */
export function OnboardingShell({
  step,
  children,
  leading,
}: OnboardingShellProps) {
  const theme = useTheme();

  return (
    <LinearGradient
      colors={[...growthOnboardingGradient]}
      end={{ x: 1, y: 1 }}
      start={{ x: 0.05, y: 0 }}
      style={styles.fill}
    >
      <StatusBar style="dark" />
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={styles.safe}
      >
        <View
          style={{
            alignItems: 'center',
            flexDirection: 'row',
            paddingHorizontal: theme.spacing.lg,
            paddingTop: theme.spacing.sm,
          }}
        >
          <View style={styles.side}>{leading}</View>

          <View style={{ alignItems: 'center', flex: 1, gap: theme.spacing.md }}>
            <AppText
              variant="body"
              style={{
                color: theme.colors.text,
                fontSize: 17,
                fontWeight: '600',
                letterSpacing: -0.2,
              }}
            >
              growth
            </AppText>
            <View style={{ flexDirection: 'row', gap: theme.spacing.sm }}>
              <ProgressSegment active />
              <ProgressSegment active={step === 'themes'} />
            </View>
          </View>

          <View style={styles.side} />
        </View>

        <View style={styles.fill}>{children}</View>
      </SafeAreaView>
    </LinearGradient>
  );
}

function ProgressSegment({ active }: { active?: boolean }) {
  return (
    <View
      style={{
        backgroundColor: active
          ? growthBrandAccent
          : 'rgba(26, 26, 24, 0.14)',
        borderRadius: 999,
        height: 3,
        width: 28,
      }}
    />
  );
}

const styles = StyleSheet.create({
  fill: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  safe: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  side: {
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    minHeight: 40,
    width: 56,
  },
});
