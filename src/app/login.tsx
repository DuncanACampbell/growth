import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { useMockSession } from '@/lib/mock-session';
import { useTheme } from '@/theme';

export default function LoginScreen() {
  const theme = useTheme();
  const { isSignedIn, signIn, signUp } = useMockSession();

  if (isSignedIn) {
    return <Redirect href="/home" />;
  }

  function enter() {
    signIn('incomplete');
    router.replace('/home');
  }

  return (
    <LinearGradient
      colors={['#D86B6E', '#E88A9A', '#B397E8', '#90B9E9', '#88CBB0']}
      end={{ x: 1, y: 1 }}
      start={{ x: 0.05, y: 0 }}
      style={styles.gradient}
    >
      <StatusBar style="light" />
      <SafeAreaView
        edges={['top', 'right', 'bottom', 'left']}
        style={styles.safe}
      >
        <View
          style={[
            styles.content,
            {
              paddingBottom: theme.spacing.xl,
              paddingHorizontal: theme.spacing.xl,
              paddingTop: theme.spacing.xl,
            },
          ]}
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
              gap: theme.spacing.md,
              marginTop: 'auto',
            }}
          >
            <AppButton
              fullWidth
              onPress={() => {
                signUp();
                router.replace('/home');
              }}
              style={{
                backgroundColor: 'rgba(255,255,255,0.42)',
                borderColor: 'rgba(255,255,255,0.58)',
                borderWidth: 1,
              }}
            >
              Sign up
            </AppButton>
            <AppButton
              fullWidth
              onPress={enter}
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
  content: {
    flex: 1,
  },
});
