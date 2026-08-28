import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Keyboard,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { AppText } from '@/components/ui/AppText';
import {
  buildErrorToastClipboardText,
  sanitizeUserFacingMessage,
  USER_FACING,
} from '@/lib/errors/user-facing';
import { useTheme } from '@/theme';

export type ToastType = 'error' | 'success' | 'info';

export type ShowToastOptions = {
  type?: ToastType;
  message: string;
  durationMs?: number;
  technicalError?: unknown;
};

export type ShowErrorToastOptions = {
  message: string;
  technicalError?: unknown;
  durationMs?: number;
};

type ToastRecord = {
  id: number;
  type: ToastType;
  message: string;
  durationMs: number;
  technicalError?: unknown;
};

type ToastContextValue = {
  showToast: (options: ShowToastOptions) => void;
  showErrorToast: (options: ShowErrorToastOptions) => void;
  dismissToast: () => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION_MS = 3000;
const ENTER_MS = 260;
const EXIT_MS = 220;
const SLIDE_DISTANCE = 72;
const COPY_FEEDBACK_MS = 1800;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastRecord | null>(null);
  const idRef = useRef(0);

  const dismissToast = useCallback(() => {
    setToast(null);
  }, []);

  const showToast = useCallback((options: ShowToastOptions) => {
    const type = options.type ?? 'info';
    const fallback = USER_FACING.generic;
    const message = sanitizeUserFacingMessage(options.message, fallback);
    idRef.current += 1;
    setToast({
      id: idRef.current,
      type,
      message,
      durationMs: options.durationMs ?? DEFAULT_DURATION_MS,
      technicalError: type === 'error' ? options.technicalError : undefined,
    });
  }, []);

  const showErrorToast = useCallback(
    (options: ShowErrorToastOptions) => {
      showToast({
        type: 'error',
        message: options.message,
        technicalError: options.technicalError,
        durationMs: options.durationMs,
      });
    },
    [showToast],
  );

  const value = useMemo(
    () => ({
      showToast,
      showErrorToast,
      dismissToast,
    }),
    [showToast, showErrorToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost toast={toast} onRequestDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error('useToast must be used within ToastProvider.');
  }
  return value;
}

function ToastHost({
  toast,
  onRequestDismiss,
}: {
  toast: ToastRecord | null;
  onRequestDismiss: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const [opacity] = useState(() => new Animated.Value(0));
  const [translateY] = useState(() => new Animated.Value(SLIDE_DISTANCE));
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const visibleIdRef = useRef<number | null>(null);
  const exitingRef = useRef(false);
  const dismissTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    void AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!cancelled) {
        setReduceMotion(enabled);
      }
    });
    const subscription = AccessibilityInfo.addEventListener?.(
      'reduceMotionChanged',
      setReduceMotion,
    );
    return () => {
      cancelled = true;
      subscription?.remove?.();
    };
  }, []);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const showSub = Keyboard.addListener(showEvent, (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSub = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const animateOut = useCallback(
    (toastId: number, then?: () => void) => {
      if (exitingRef.current) {
        return;
      }
      exitingRef.current = true;

      if (reduceMotion) {
        opacity.setValue(0);
        translateY.setValue(SLIDE_DISTANCE);
        if (visibleIdRef.current === toastId) {
          then?.();
        }
        exitingRef.current = false;
        return;
      }

      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: EXIT_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: SLIDE_DISTANCE,
          duration: EXIT_MS,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        exitingRef.current = false;
        if (finished && visibleIdRef.current === toastId) {
          then?.();
        }
      });
    },
    [opacity, reduceMotion, translateY],
  );

  const scheduleDismiss = useCallback(
    (toastId: number, delayMs: number) => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
      }
      dismissTimeoutRef.current = setTimeout(() => {
        animateOut(toastId, onRequestDismiss);
      }, delayMs);
    },
    [animateOut, onRequestDismiss],
  );

  useEffect(() => {
    if (!toast) {
      visibleIdRef.current = null;
      exitingRef.current = false;
      return;
    }

    const toastId = toast.id;
    visibleIdRef.current = toastId;
    exitingRef.current = false;

    if (reduceMotion) {
      opacity.setValue(1);
      translateY.setValue(0);
    } else {
      opacity.setValue(0);
      translateY.setValue(SLIDE_DISTANCE);
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: ENTER_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: ENTER_MS,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }

    scheduleDismiss(toastId, toast.durationMs);

    return () => {
      if (dismissTimeoutRef.current) {
        clearTimeout(dismissTimeoutRef.current);
        dismissTimeoutRef.current = null;
      }
    };
  }, [
    toast,
    onRequestDismiss,
    opacity,
    translateY,
    reduceMotion,
    animateOut,
    scheduleDismiss,
  ]);

  if (!toast) {
    return null;
  }

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';

  const accent = isSuccess
    ? theme.colors.primary
    : isError
      ? theme.colors.danger
      : theme.colors.textMuted;

  const surface =
    theme.scheme === 'dark'
      ? isError
        ? 'rgba(52, 36, 34, 0.96)'
        : 'rgba(40, 36, 32, 0.96)'
      : isError
        ? 'rgba(255, 246, 243, 0.96)'
        : 'rgba(255, 251, 247, 0.96)';

  const border =
    theme.scheme === 'dark'
      ? isError
        ? 'rgba(227, 154, 148, 0.28)'
        : theme.colors.border
      : isError
        ? 'rgba(143, 61, 58, 0.18)'
        : 'rgba(228, 228, 223, 0.9)';

  const iconName =
    isSuccess
      ? 'checkmark-circle-outline'
      : isError
        ? 'alert-circle-outline'
        : 'information-circle-outline';

  const bottomOffset =
    Math.max(insets.bottom, theme.spacing.sm) +
    theme.spacing.md +
    keyboardHeight;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.host,
        {
          bottom: bottomOffset,
          left: theme.spacing.xl,
          right: theme.spacing.xl,
        },
      ]}
    >
      <Animated.View
        accessibilityLiveRegion="polite"
        accessibilityRole="alert"
        style={{
          opacity,
          transform: [{ translateY }],
        }}
      >
        <View
          style={{
            alignItems: 'center',
            backgroundColor: surface,
            borderColor: border,
            borderRadius: theme.radii.xl,
            borderWidth: StyleSheet.hairlineWidth,
            flexDirection: 'row',
            gap: theme.spacing.md,
            paddingLeft: theme.spacing.lg,
            paddingRight: theme.spacing.sm,
            paddingVertical: theme.spacing.md,
            shadowColor: '#1A1A18',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: theme.scheme === 'dark' ? 0.28 : 0.08,
            shadowRadius: 18,
            elevation: 3,
          }}
        >
          <Ionicons name={iconName} size={20} color={accent} />
          <AppText
            variant="body"
            style={{
              color: theme.colors.text,
              flex: 1,
              fontSize: 15,
              lineHeight: 21,
            }}
            numberOfLines={3}
          >
            {toast.message}
          </AppText>
          {isError ? (
            <ErrorCopyButton
              key={toast.id}
              userMessage={toast.message}
              technicalError={toast.technicalError}
              iconColor={theme.colors.textMuted}
              onCopied={() => {
                scheduleDismiss(toast.id, COPY_FEEDBACK_MS);
              }}
            />
          ) : (
            <Pressable
              accessibilityLabel="Dismiss"
              accessibilityRole="button"
              hitSlop={12}
              onPress={() => {
                animateOut(toast.id, onRequestDismiss);
              }}
              style={{
                alignItems: 'center',
                height: 36,
                justifyContent: 'center',
                width: 36,
              }}
            >
              <Ionicons
                name="close"
                size={18}
                color={theme.colors.textMuted}
                style={{ opacity: 0.7 }}
              />
            </Pressable>
          )}
        </View>
      </Animated.View>
    </View>
  );
}

function ErrorCopyButton({
  userMessage,
  technicalError,
  iconColor,
  onCopied,
}: {
  userMessage: string;
  technicalError: unknown;
  iconColor: string;
  onCopied: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const copiedTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copiedTimeoutRef.current) {
        clearTimeout(copiedTimeoutRef.current);
      }
    };
  }, []);

  async function handleCopy() {
    const text = buildErrorToastClipboardText(userMessage, technicalError);
    try {
      await Clipboard.setStringAsync(text);
    } catch {
      return;
    }

    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics are unavailable on some platforms.
    }

    setCopied(true);
    onCopied();
    if (copiedTimeoutRef.current) {
      clearTimeout(copiedTimeoutRef.current);
    }
    copiedTimeoutRef.current = setTimeout(() => {
      setCopied(false);
    }, COPY_FEEDBACK_MS);
  }

  return (
    <Pressable
      accessibilityLabel={copied ? 'Copied error details' : 'Copy error details'}
      accessibilityRole="button"
      onPress={() => {
        void handleCopy();
      }}
      style={{
        alignItems: 'center',
        flexShrink: 0,
        height: 44,
        justifyContent: 'center',
        width: 44,
      }}
    >
      <Ionicons
        name={copied ? 'checkmark-outline' : 'copy-outline'}
        size={18}
        color={iconColor}
        style={{ opacity: copied ? 0.9 : 0.55 }}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
    zIndex: 1000,
  },
});
