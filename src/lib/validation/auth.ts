import { USER_FACING } from '@/lib/errors/user-facing';

/** Minimum length for creating or changing a password. */
export const PASSWORD_MIN_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Field validation result.
 * - `required`: empty field — prefer placeholder + outline, no under-copy
 * - `message`: needs a short explanation under the field
 */
export type FieldValidation =
  | { kind: 'ok' }
  | { kind: 'required' }
  | { kind: 'message'; message: string };

export function isFieldInvalid(result: FieldValidation): boolean {
  return result.kind !== 'ok';
}

export function fieldMessage(result: FieldValidation): string | null {
  return result.kind === 'message' ? result.message : null;
}

export function validateEmail(raw: string): FieldValidation {
  const email = raw.trim();
  if (!email) {
    return { kind: 'required' };
  }
  if (!EMAIL_PATTERN.test(email)) {
    return { kind: 'message', message: USER_FACING.invalidEmail };
  }
  return { kind: 'ok' };
}

/** Empty check only — used for log in (no strength rules). */
export function validatePasswordPresent(raw: string): FieldValidation {
  if (!raw.trim()) {
    return { kind: 'required' };
  }
  return { kind: 'ok' };
}

/** Strength rules for account creation / password changes only. */
export function validatePasswordForSignUp(raw: string): FieldValidation {
  const present = validatePasswordPresent(raw);
  if (present.kind !== 'ok') {
    return present;
  }
  if (raw.length < PASSWORD_MIN_LENGTH) {
    return { kind: 'message', message: USER_FACING.weakPassword };
  }
  return { kind: 'ok' };
}
