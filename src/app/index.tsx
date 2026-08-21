import { StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { isFirebaseConfigured } from '@/lib/firebase';
import { useTheme } from '@/theme';

export default function HomeScreen() {
  const theme = useTheme();
  const firebaseReady = isFirebaseConfigured();

  return (
    <Screen
      style={[
        styles.screen,
        {
          paddingHorizontal: theme.spacing.xl,
          gap: theme.spacing.xl,
        },
      ]}
    >
      <View style={[styles.copy, { gap: theme.spacing.sm }]}>
        <AppText variant="title">Growth</AppText>
        <AppText variant="body" tone="muted">
          The project is running. This is a placeholder home screen.
        </AppText>
      </View>

      <View
        style={{
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radii.md,
          borderWidth: 1,
          padding: theme.spacing.lg,
          gap: theme.spacing.xs,
        }}
      >
        <AppText variant="caption" tone="muted">
          Firebase
        </AppText>
        <AppText variant="body">
          {firebaseReady ? 'Configured' : 'Not configured yet'}
        </AppText>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: 'center',
  },
  copy: {},
});
