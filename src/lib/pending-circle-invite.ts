import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Href } from 'expo-router';

const PENDING_CIRCLE_INVITE_KEY = 'growth.pendingCircleInviteToken';

/** Stash an invite token across login — accepted/consumed in a later step. */
export async function stashPendingCircleInviteToken(
  inviteToken: string,
): Promise<void> {
  const trimmed = inviteToken.trim();
  if (!trimmed) {
    return;
  }
  await AsyncStorage.setItem(PENDING_CIRCLE_INVITE_KEY, trimmed);
}

export async function peekPendingCircleInviteToken(): Promise<string | null> {
  const value = await AsyncStorage.getItem(PENDING_CIRCLE_INVITE_KEY);
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : null;
}

export async function clearPendingCircleInviteToken(): Promise<void> {
  await AsyncStorage.removeItem(PENDING_CIRCLE_INVITE_KEY);
}

/**
 * Reads and clears a pending invite token in one step.
 * Returns null on missing token or storage errors (caller keeps normal routing).
 */
export async function takePendingCircleInviteToken(): Promise<string | null> {
  try {
    const token = await peekPendingCircleInviteToken();
    if (!token) {
      return null;
    }
    await clearPendingCircleInviteToken();
    return token;
  } catch {
    return null;
  }
}

export function hrefForCircleInvite(inviteToken: string): Href {
  return `/invite/${inviteToken}`;
}

/**
 * After successful auth: prefer a stashed Circle invite, else the normal destination.
 * Clears the pending token only when returning the invite route.
 */
export async function resolveHrefAfterAuth(fallback: Href): Promise<Href> {
  const token = await takePendingCircleInviteToken();
  if (!token) {
    return fallback;
  }
  return hrefForCircleInvite(token);
}
