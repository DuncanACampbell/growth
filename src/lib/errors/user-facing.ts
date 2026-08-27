/**
 * Maps technical failures to short, user-facing copy.
 * Log the original error in development; never show raw SDK/HTTP strings in UI.
 */

export const USER_FACING = {
  offline: 'You appear to be offline.',
  generic: 'Something went wrong. Please try again.',
  accountCreateFailed: 'We couldn’t create your account. Please try again.',
  incorrectCredentials: 'Email or password is incorrect.',
  emailInUse: 'An account with this email already exists.',
  weakPassword: 'Use at least 8 characters',
  invalidEmail: 'Enter a valid email address',
  saveFailed: 'Couldn’t save your changes. Try again.',
  loadFailed: 'Couldn’t load that. Please try again.',
} as const;

function readErrorCode(error: unknown): string {
  if (error && typeof error === 'object' && 'code' in error) {
    return String((error as { code: unknown }).code);
  }
  return '';
}

function readErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message.trim();
  }
  return '';
}

export function isNetworkError(error: unknown): boolean {
  const code = readErrorCode(error).toLowerCase();
  const message = readErrorMessage(error).toLowerCase();
  if (
    code.includes('network') ||
    code === 'auth/network-request-failed' ||
    code === 'unavailable'
  ) {
    return true;
  }
  return (
    message.includes('network') ||
    message.includes('offline') ||
    message.includes('failed to fetch')
  );
}

export type AuthFailureKind =
  | 'incorrect_credentials'
  | 'email_in_use'
  | 'weak_password'
  | 'invalid_email'
  | 'offline'
  | 'generic';

export function classifyAuthError(error: unknown): AuthFailureKind {
  const code = readErrorCode(error);

  if (isNetworkError(error)) {
    return 'offline';
  }

  switch (code) {
    case 'auth/invalid-email':
      return 'invalid_email';
    case 'auth/weak-password':
    case 'auth/password-does-not-meet-requirements':
      return 'weak_password';
    case 'auth/email-already-in-use':
      return 'email_in_use';
    case 'auth/wrong-password':
    case 'auth/user-not-found':
    case 'auth/invalid-credential':
    case 'auth/invalid-login-credentials':
      return 'incorrect_credentials';
    default:
      return 'generic';
  }
}

export function toUserFacingAuthMessage(
  kind: AuthFailureKind,
  mode?: 'signUp' | 'signIn',
): string {
  switch (kind) {
    case 'incorrect_credentials':
      return USER_FACING.incorrectCredentials;
    case 'email_in_use':
      return USER_FACING.emailInUse;
    case 'weak_password':
      return USER_FACING.weakPassword;
    case 'invalid_email':
      return USER_FACING.invalidEmail;
    case 'offline':
      return USER_FACING.offline;
    case 'generic':
      return mode === 'signUp'
        ? USER_FACING.accountCreateFailed
        : USER_FACING.generic;
  }
}

/**
 * True when a string looks like a raw SDK/exception dump rather than product copy.
 */
export function looksLikeTechnicalErrorMessage(message: string): boolean {
  const value = message.trim();
  if (!value) {
    return true;
  }
  return (
    /FirebaseError|Firebase:|auth\/[a-z0-9-]+|HttpsError|functions\//i.test(
      value,
    ) ||
    /permission-denied|insufficient privileges|Missing or insufficient/i.test(
      value,
    ) ||
    /\[[\w.-]+\]\s/.test(value) ||
    /Error:|Exception:|at Object\.|TypeError|ReferenceError/i.test(value) ||
    value.length > 140
  );
}

/** Prefer a safe human message; never pass technical dumps to UI. */
export function sanitizeUserFacingMessage(
  message: string,
  fallback: string = USER_FACING.generic,
): string {
  const trimmed = message.trim();
  if (!trimmed || looksLikeTechnicalErrorMessage(trimmed)) {
    return fallback;
  }
  return trimmed;
}

/**
 * Log technical detail in development without triggering React Native LogBox
 * banners (console.error / console.warn surface as red/yellow UI overlays).
 */
export function logTechnicalError(scope: string, error: unknown): void {
  if (__DEV__) {
    console.log(`[${scope}]`, error);
  }
}
