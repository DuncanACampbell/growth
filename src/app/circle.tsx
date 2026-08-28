import { Ionicons } from '@expo/vector-icons';
import { Redirect, router } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActionSheetIOS,
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Share,
  TextInput,
  View,
} from 'react-native';

import { CircleRecommendationsCarousel } from '@/components/circle/CircleRecommendationsCarousel';
import { AppButton } from '@/components/ui/AppButton';
import { AppText } from '@/components/ui/AppText';
import { KeyboardAwareScroll } from '@/components/ui/KeyboardAwareScroll';
import { Screen } from '@/components/ui/Screen';
import { useAuthSession } from '@/lib/auth-session';
import { createCircleInvite } from '@/lib/firebase/circle-invites';
import {
  connectionDocumentId,
  createConnection,
  listCircleMembers,
  removeConnection,
  type CircleMember,
} from '@/lib/firebase/connections';
import {
  listCircleRecommendations,
  type CircleRecommendation,
} from '@/lib/firebase/user-recommendations';
import { sanitizeUserFacingMessage } from '@/lib/errors/user-facing';
import { useMockSession } from '@/lib/mock-session';
import { needsOnboarding, routeForOnboardingStep } from '@/lib/onboarding';
import { useToast } from '@/lib/toast';
import { ThemeProvider, useTheme } from '@/theme';
import { appFonts } from '@/theme/fonts';

type WebDialog =
  | { kind: 'actions'; member: CircleMember }
  | { kind: 'confirm'; member: CircleMember }
  | null;

export default function CircleScreen() {
  return (
    <ThemeProvider scheme="light">
      <CircleScreenContent />
    </ThemeProvider>
  );
}

function CircleScreenContent() {
  const theme = useTheme();
  const { showToast } = useToast();
  const { user: authUser, isReady: authReady } = useAuthSession();
  const { isSignedIn, world } = useMockSession();
  const [members, setMembers] = useState<CircleMember[]>([]);
  const [recommendations, setRecommendations] = useState<CircleRecommendation[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [devOtherUid, setDevOtherUid] = useState('');
  const [devBusy, setDevBusy] = useState(false);
  const [inviteBusy, setInviteBusy] = useState(false);
  const [addingUserId, setAddingUserId] = useState<string | null>(null);
  const [webDialog, setWebDialog] = useState<WebDialog>(null);
  const scrollRef = useRef<ScrollView>(null);

  const firebaseUid = authUser?.uid ?? null;

  const refreshMembers = useCallback(async () => {
    if (!firebaseUid) {
      setMembers([]);
      setRecommendations([]);
      setLoading(false);
      return;
    }
    try {
      const next = await listCircleMembers(firebaseUid);
      setMembers(next);
      const nextRecommendations = await listCircleRecommendations({
        currentUserId: firebaseUid,
        connectedUserIds: next.map((member) => member.userId),
      });
      setRecommendations(nextRecommendations);
    } catch (caught) {
      const message = sanitizeUserFacingMessage(
        caught instanceof Error ? caught.message : '',
        'We couldn’t load your Circle right now.',
      );
      showToast({ type: 'error', message });
      setMembers([]);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  }, [firebaseUid, showToast]);

  useEffect(() => {
    if (!authReady) {
      return;
    }

    let cancelled = false;

    async function load() {
      if (!firebaseUid) {
        if (!cancelled) {
          setMembers([]);
          setLoading(false);
        }
        return;
      }

      try {
        const next = await listCircleMembers(firebaseUid);
        const nextRecommendations = await listCircleRecommendations({
          currentUserId: firebaseUid,
          connectedUserIds: next.map((member) => member.userId),
        });
        if (!cancelled) {
          setMembers(next);
          setRecommendations(nextRecommendations);
        }
      } catch (caught) {
        const message = sanitizeUserFacingMessage(
          caught instanceof Error ? caught.message : '',
          'We couldn’t load your Circle right now.',
        );
        if (!cancelled) {
          showToast({ type: 'error', message });
          setMembers([]);
          setRecommendations([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [authReady, firebaseUid, showToast]);

  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }

  if (needsOnboarding(world.user)) {
    return <Redirect href={routeForOnboardingStep(world.user.onboardingStep)} />;
  }

  function goBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace('/home');
  }

  async function handleAddRecommendation(recommendation: CircleRecommendation) {
    if (!firebaseUid || addingUserId) {
      return;
    }
    setAddingUserId(recommendation.userId);
    try {
      const result = await createConnection({
        currentUserId: firebaseUid,
        otherUserId: recommendation.userId,
      });
      const connectionId =
        result.connectionId ||
        connectionDocumentId(firebaseUid, recommendation.userId);
      const newMember: CircleMember = {
        connectionId,
        userId: recommendation.userId,
        displayLabel: recommendation.displayLabel,
      };
      setRecommendations((current) =>
        current.filter((item) => item.userId !== recommendation.userId),
      );
      setMembers((current) =>
        [...current, newMember].sort((a, b) =>
          a.displayLabel.localeCompare(b.displayLabel),
        ),
      );
    } catch (caught) {
      const message = sanitizeUserFacingMessage(
        caught instanceof Error ? caught.message : '',
        'Couldn’t add that person to your Circle.',
      );
      showToast({ type: 'error', message });
    } finally {
      setAddingUserId(null);
    }
  }

  async function handleAddSomeone() {
    if (!firebaseUid || inviteBusy) {
      return;
    }
    setInviteBusy(true);
    try {
      const invite = await createCircleInvite({ inviterId: firebaseUid });
      const message = `Join me on Growth and connect with me: ${invite.inviteUrl}`;
      await Share.share(
        Platform.OS === 'ios'
          ? { message, url: invite.inviteUrl }
          : { message },
      );
    } catch (caught) {
      const message = sanitizeUserFacingMessage(
        caught instanceof Error ? caught.message : '',
        'Couldn’t create that invite.',
      );
      showToast({ type: 'error', message });
    } finally {
      setInviteBusy(false);
    }
  }

  async function handleDevCreateConnection() {
    if (!firebaseUid || devBusy) {
      return;
    }
    setDevBusy(true);
    try {
      const result = await createConnection({
        currentUserId: firebaseUid,
        otherUserId: devOtherUid,
      });
      showToast({
        type: 'success',
        message: result.created
          ? 'Test connection created.'
          : 'Connection already existed.',
      });
      setDevOtherUid('');
      await refreshMembers();
    } catch (caught) {
      const message = sanitizeUserFacingMessage(
        caught instanceof Error ? caught.message : '',
        'Couldn’t create that connection.',
      );
      showToast({ type: 'error', message });
    } finally {
      setDevBusy(false);
    }
  }

  async function handleRemoveMember(member: CircleMember) {
    if (!firebaseUid) {
      return;
    }
    try {
      await removeConnection({
        currentUserId: firebaseUid,
        otherUserId: member.userId,
      });
      await refreshMembers();
    } catch (caught) {
      const message = sanitizeUserFacingMessage(
        caught instanceof Error ? caught.message : '',
        'Couldn’t remove that person from your Circle.',
      );
      showToast({ type: 'error', message });
    }
  }

  function confirmRemoveMember(member: CircleMember) {
    if (Platform.OS === 'web') {
      setWebDialog({ kind: 'confirm', member });
      return;
    }

    Alert.alert(
      `Remove ${member.displayLabel} from your Circle?`,
      'You’ll both be removed from each other’s Circle.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            void handleRemoveMember(member);
          },
        },
      ],
    );
  }

  function openMemberActions(member: CircleMember) {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Remove from Circle'],
          cancelButtonIndex: 0,
          destructiveButtonIndex: 1,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            confirmRemoveMember(member);
          }
        },
      );
      return;
    }

    if (Platform.OS === 'web') {
      setWebDialog({ kind: 'actions', member });
      return;
    }

    Alert.alert(member.displayLabel, undefined, [
      {
        text: 'Remove from Circle',
        style: 'destructive',
        onPress: () => {
          confirmRemoveMember(member);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  const showEmpty = !loading && members.length === 0;

  return (
    <Screen>
      <KeyboardAwareScroll
        scrollRef={scrollRef}
        contentContainerStyle={{
          paddingBottom: theme.spacing.xxl,
          paddingHorizontal: theme.spacing.xl,
          paddingTop: theme.spacing.md,
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

        <View style={{ gap: theme.spacing.sm, marginTop: theme.spacing.lg }}>
          <AppText variant="title">Circle</AppText>
          <AppText variant="body" tone="muted">
            The people you’re connected with on Growth.
          </AppText>
        </View>

        <CircleRecommendationsCarousel
          recommendations={recommendations}
          addingUserId={addingUserId}
          onAdd={(recommendation) => {
            void handleAddRecommendation(recommendation);
          }}
        />

        {loading ? (
          <View
            style={{
              alignItems: 'center',
              flex: 1,
              justifyContent: 'center',
              paddingVertical: theme.spacing.xxxl,
            }}
          >
            <ActivityIndicator color={theme.colors.textMuted} />
          </View>
        ) : showEmpty ? (
          <View
            style={{
              alignItems: 'flex-start',
              flex: 1,
              gap: theme.spacing.xl,
              justifyContent: 'center',
              maxWidth: 360,
              paddingVertical: theme.spacing.xxl,
            }}
          >
            <AppText variant="body" tone="muted">
              Your Circle is empty for now. Add someone when you’re ready.
            </AppText>
            <AppButton
              accessibilityLabel="Add someone"
              disabled={inviteBusy || !firebaseUid}
              onPress={() => {
                void handleAddSomeone();
              }}
            >
              {inviteBusy ? 'Preparing invite…' : 'Add someone'}
            </AppButton>
          </View>
        ) : (
          <View
            style={{
              gap: theme.spacing.lg,
              marginTop: theme.spacing.xxl,
            }}
          >
            {members.map((member) => (
              <View
                key={member.connectionId}
                style={{
                  alignItems: 'center',
                  borderBottomColor: theme.colors.border,
                  borderBottomWidth: 1,
                  flexDirection: 'row',
                  gap: theme.spacing.md,
                  paddingBottom: theme.spacing.md,
                }}
              >
                <AppText variant="body" style={{ flex: 1 }}>
                  {member.displayLabel}
                </AppText>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`More options for ${member.displayLabel}`}
                  hitSlop={8}
                  onPress={() => {
                    openMemberActions(member);
                  }}
                  style={{
                    alignItems: 'center',
                    height: 40,
                    justifyContent: 'center',
                    width: 40,
                  }}
                >
                  <Ionicons
                    name="ellipsis-horizontal"
                    size={20}
                    color={theme.colors.textMuted}
                  />
                </Pressable>
              </View>
            ))}
            <AppButton
              accessibilityLabel="Add someone"
              disabled={inviteBusy || !firebaseUid}
              onPress={() => {
                void handleAddSomeone();
              }}
              style={{ alignSelf: 'flex-start', marginTop: theme.spacing.md }}
            >
              {inviteBusy ? 'Preparing invite…' : 'Add someone'}
            </AppButton>
          </View>
        )}

        {__DEV__ ? (
          <View
            style={{
              borderColor: theme.colors.border,
              borderRadius: theme.radii.lg,
              borderWidth: 1,
              gap: theme.spacing.md,
              marginTop: theme.spacing.xxxl,
              padding: theme.spacing.lg,
            }}
          >
            <AppText variant="caption" tone="muted">
              TEMPORARY / DEV ONLY — create a test connection by Firebase UID
            </AppText>
            {firebaseUid ? (
              <AppText variant="caption" tone="muted">
                Your UID: {firebaseUid}
              </AppText>
            ) : (
              <AppText variant="caption" tone="danger">
                Sign in with Firebase to test connections.
              </AppText>
            )}
            <TextInput
              value={devOtherUid}
              onChangeText={setDevOtherUid}
              autoCapitalize="none"
              autoCorrect={false}
              editable={Boolean(firebaseUid) && !devBusy}
              placeholder="Other user’s Firebase UID"
              placeholderTextColor={theme.colors.textMuted}
              onFocus={() => {
                requestAnimationFrame(() => {
                  scrollRef.current?.scrollToEnd({ animated: true });
                });
              }}
              style={{
                borderColor: theme.colors.border,
                borderRadius: theme.radii.md,
                borderWidth: 1,
                color: theme.colors.text,
                fontFamily: appFonts.regular,
                fontSize: 15,
                minHeight: 44,
                paddingHorizontal: theme.spacing.md,
                paddingVertical: theme.spacing.sm,
              }}
            />
            <AppButton
              variant="secondary"
              disabled={!firebaseUid || !devOtherUid.trim() || devBusy}
              onPress={() => {
                void handleDevCreateConnection();
              }}
            >
              {devBusy ? 'Creating…' : 'Create test connection'}
            </AppButton>
          </View>
        ) : null}
      </KeyboardAwareScroll>

      {Platform.OS === 'web' && webDialog ? (
        <Modal
          transparent
          animationType="fade"
          visible
          onRequestClose={() => {
            setWebDialog(null);
          }}
        >
          <View
            style={{
              alignItems: 'center',
              backgroundColor: 'rgba(28, 25, 22, 0.35)',
              flex: 1,
              justifyContent: 'center',
              paddingHorizontal: theme.spacing.xl,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Dismiss"
              onPress={() => {
                setWebDialog(null);
              }}
              style={{
                bottom: 0,
                left: 0,
                position: 'absolute',
                right: 0,
                top: 0,
              }}
            />
            <View
              style={{
                backgroundColor: theme.colors.surface,
                borderRadius: theme.radii.xl,
                gap: theme.spacing.md,
                maxWidth: 400,
                padding: theme.spacing.xl,
                width: '100%',
                zIndex: 1,
              }}
            >
              {webDialog.kind === 'actions' ? (
                <>
                  <AppText variant="subtitle">{webDialog.member.displayLabel}</AppText>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Remove from Circle"
                    onPress={() => {
                      setWebDialog({
                        kind: 'confirm',
                        member: webDialog.member,
                      });
                    }}
                    style={{
                      paddingVertical: theme.spacing.md,
                    }}
                  >
                    <AppText variant="body" tone="danger">
                      Remove from Circle
                    </AppText>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Cancel"
                    onPress={() => {
                      setWebDialog(null);
                    }}
                    style={{ paddingVertical: theme.spacing.sm }}
                  >
                    <AppText variant="body" tone="muted">
                      Cancel
                    </AppText>
                  </Pressable>
                </>
              ) : (
                <>
                  <AppText variant="subtitle">
                    Remove {webDialog.member.displayLabel} from your Circle?
                  </AppText>
                  <AppText variant="body" tone="muted">
                    You’ll both be removed from each other’s Circle.
                  </AppText>
                  <View
                    style={{
                      flexDirection: 'row',
                      gap: theme.spacing.md,
                      justifyContent: 'flex-end',
                      marginTop: theme.spacing.sm,
                    }}
                  >
                    <AppButton
                      variant="secondary"
                      onPress={() => {
                        setWebDialog(null);
                      }}
                    >
                      Cancel
                    </AppButton>
                    <AppButton
                      onPress={() => {
                        const member = webDialog.member;
                        setWebDialog(null);
                        void handleRemoveMember(member);
                      }}
                    >
                      Remove
                    </AppButton>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>
      ) : null}
    </Screen>
  );
}
