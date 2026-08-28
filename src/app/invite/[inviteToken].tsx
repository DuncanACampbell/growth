import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { Screen } from '@/components/ui/Screen';
import { useAuthSession } from '@/lib/auth-session';
import {
  getCircleInvite,
  type CircleInviteDocument,
} from '@/lib/firebase/circle-invites';
import {
  displayLabelForUser,
  getUserPublicProfile,
} from '@/lib/firebase/connections';
import { sanitizeUserFacingMessage } from '@/lib/errors/user-facing';
import { useMockSession } from '@/lib/mock-session';
import { stashPendingCircleInviteToken } from '@/lib/pending-circle-invite';
import { useToast } from '@/lib/toast';
import { ThemeProvider, useTheme } from '@/theme';

type InviteLoadState =
  | { kind: 'loading' }
  | { kind: 'ready'; invite: CircleInviteDocument; inviterLabel: string }
  | { kind: 'error'; message: string };

function resolveInviteToken(
  param: string | string[] | undefined,
): string | null {
  if (typeof param === 'string' && param.trim().length > 0) {
    return param.trim();
  }
  if (Array.isArray(param)) {
    const first = param.find(
      (value) => typeof value === 'string' && value.trim().length > 0,
    );
    return first?.trim() ?? null;
  }
  return null;
}

function dismissInvite() {
  if (router.canGoBack()) {
    router.back();
    return;
  }
  router.replace('/home');
}

export default function CircleInviteScreen() {
  return (
    <ThemeProvider scheme="light">
      <CircleInviteScreenContent />
    </ThemeProvider>
  );
}

function CircleInviteScreenContent() {
  const theme = useTheme();
  const { showToast } = useToast();
  const { inviteToken: inviteTokenParam } = useLocalSearchParams<{
    inviteToken?: string | string[];
  }>();
  const inviteToken = resolveInviteToken(inviteTokenParam);
  const { isReady: mockReady, isSignedIn, world } = useMockSession();
  const { isReady: authReady, user: authUser } = useAuthSession();
  const [loadState, setLoadState] = useState<InviteLoadState>({
    kind: 'loading',
  });
  const [pendingAuthRedirect, setPendingAuthRedirect] = useState(false);

  const sessionsReady = mockReady && authReady;
  const signedIn = Boolean(isSignedIn && world && authUser);
  const needsLoginRedirect = sessionsReady && Boolean(inviteToken) && !signedIn;

  useEffect(() => {
    if (!needsLoginRedirect || !inviteToken) {
      return;
    }

    let cancelled = false;
    void stashPendingCircleInviteToken(inviteToken).finally(() => {
      if (!cancelled) {
        setPendingAuthRedirect(true);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [inviteToken, needsLoginRedirect]);

  useEffect(() => {
    if (!sessionsReady || !signedIn || !inviteToken) {
      return;
    }

    let cancelled = false;

    async function loadInvite() {
      try {
        const invite = await getCircleInvite(inviteToken!);
        if (cancelled) {
          return;
        }
        if (!invite) {
          setLoadState({
            kind: 'error',
            message: 'This invite isn’t available anymore.',
          });
          return;
        }
        if (invite.status !== 'pending') {
          setLoadState({
            kind: 'error',
            message: 'This invite has already been used or is no longer valid.',
          });
          return;
        }

        const profile = await getUserPublicProfile(invite.inviterId);
        if (cancelled) {
          return;
        }
        setLoadState({
          kind: 'ready',
          invite,
          inviterLabel: displayLabelForUser(profile),
        });
      } catch (caught) {
        const message = sanitizeUserFacingMessage(
          caught instanceof Error ? caught.message : '',
          'We couldn’t open this invite right now.',
        );
        if (!cancelled) {
          setLoadState({ kind: 'error', message });
        }
      }
    }

    void loadInvite();

    return () => {
      cancelled = true;
    };
  }, [inviteToken, sessionsReady, signedIn]);

  if (!sessionsReady || (needsLoginRedirect && !pendingAuthRedirect)) {
    return (
      <Screen>
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
          }}
        >
          <ActivityIndicator color={theme.colors.textMuted} />
        </View>
      </Screen>
    );
  }

  if (!inviteToken) {
    return (
      <InviteErrorState
        message="This invite link looks incomplete."
        onDismiss={dismissInvite}
      />
    );
  }

  if (needsLoginRedirect && pendingAuthRedirect) {
    return <Redirect href="/login" />;
  }

  if (loadState.kind === 'loading') {
    return (
      <Screen>
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            paddingHorizontal: theme.spacing.xl,
          }}
        >
          <ActivityIndicator color={theme.colors.textMuted} />
        </View>
      </Screen>
    );
  }

  if (loadState.kind === 'error') {
    return (
      <InviteErrorState message={loadState.message} onDismiss={dismissInvite} />
    );
  }

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          gap: theme.spacing.xl,
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.xl,
          paddingVertical: theme.spacing.xxl,
        }}
      >
        <AppText variant="title" style={{ maxWidth: 420 }}>
          {loadState.inviterLabel} invited you to connect on Growth
        </AppText>

        <View style={{ gap: theme.spacing.md }}>
          <AppButton
            fullWidth
            accessibilityLabel="Accept"
            onPress={() => {
              if (__DEV__) {
                console.log(
                  '[circle-invite] Accept tapped; acceptance not implemented yet.',
                  loadState.invite.inviteToken,
                );
              }
              showToast({
                type: 'info',
                message: 'Accepting invites will be available soon.',
              });
            }}
          >
            Accept
          </AppButton>
          <AppButton
            fullWidth
            variant="secondary"
            accessibilityLabel="Not now"
            onPress={dismissInvite}
          >
            Not now
          </AppButton>
        </View>
      </View>
    </Screen>
  );
}

function InviteErrorState({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  const theme = useTheme();

  return (
    <Screen>
      <View
        style={{
          flex: 1,
          gap: theme.spacing.xl,
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.xl,
        }}
      >
        <View style={{ gap: theme.spacing.sm, maxWidth: 420 }}>
          <AppText variant="title">Invite unavailable</AppText>
          <AppText variant="body" tone="muted">
            {message}
          </AppText>
        </View>
        <AppButton fullWidth variant="secondary" onPress={onDismiss}>
          Continue
        </AppButton>
      </View>
    </Screen>
  );
}
