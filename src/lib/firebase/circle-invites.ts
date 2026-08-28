import Constants from 'expo-constants';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  type Timestamp,
} from 'firebase/firestore';

import { getFirestoreDb } from './client';
import { logTechnicalError } from '@/lib/errors/user-facing';

export type CircleInviteStatus = 'pending' | string;

export type CircleInviteRecord = {
  inviteToken: string;
  inviterId: string;
  inviteUrl: string;
  status: CircleInviteStatus;
};

export type CircleInviteDocument = {
  inviteToken: string;
  inviterId: string;
  status: CircleInviteStatus;
  createdAt: Timestamp | null;
};

const CIRCLE_INVITES_COLLECTION = 'circleInvites';

function resolveAppScheme(): string {
  const scheme = Constants.expoConfig?.scheme;
  if (typeof scheme === 'string' && scheme.trim().length > 0) {
    return scheme.trim();
  }
  if (Array.isArray(scheme)) {
    const first = scheme.find(
      (value): value is string =>
        typeof value === 'string' && value.trim().length > 0,
    );
    if (first) {
      return first.trim();
    }
  }
  return 'growth';
}

/** Crypto-strong token when available; otherwise a long random hex fallback. */
export function createInviteToken(): string {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID().replace(/-/g, '');
  }

  const bytes = new Uint8Array(16);
  if (typeof cryptoApi?.getRandomValues === 'function') {
    cryptoApi.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }

  return Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');
}

export function buildCircleInviteUrl(inviteToken: string): string {
  return `${resolveAppScheme()}://invite/${inviteToken}`;
}

/**
 * Creates circleInvites/{inviteToken} for the signed-in inviter.
 * Does not accept the invite or create a connection.
 */
export async function createCircleInvite(input: {
  inviterId: string;
}): Promise<CircleInviteRecord> {
  const inviterId = input.inviterId.trim();
  if (!inviterId) {
    throw new Error('You need to be signed in to invite someone.');
  }

  const inviteToken = createInviteToken();
  const inviteUrl = buildCircleInviteUrl(inviteToken);
  const ref = doc(getFirestoreDb(), CIRCLE_INVITES_COLLECTION, inviteToken);

  try {
    await setDoc(ref, {
      inviterId,
      createdAt: serverTimestamp(),
      status: 'pending',
    });
  } catch (caught) {
    logTechnicalError('circleInvites.create', caught);
    const code =
      caught && typeof caught === 'object' && 'code' in caught
        ? String((caught as { code?: string }).code ?? '')
        : '';
    if (code === 'permission-denied') {
      throw new Error(
        'Firestore blocked this invite. Publish the latest firestore.rules, then try again.',
      );
    }
    throw caught instanceof Error
      ? caught
      : new Error('Couldn’t create that invite.');
  }

  return {
    inviteToken,
    inviterId,
    inviteUrl,
    status: 'pending',
  };
}

/** Loads a single invite document. Returns null when missing. */
export async function getCircleInvite(
  inviteToken: string,
): Promise<CircleInviteDocument | null> {
  const trimmed = inviteToken.trim();
  if (!trimmed) {
    return null;
  }

  const snap = await getDoc(
    doc(getFirestoreDb(), CIRCLE_INVITES_COLLECTION, trimmed),
  );
  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();
  const inviterId =
    typeof data.inviterId === 'string' ? data.inviterId.trim() : '';
  const status = typeof data.status === 'string' ? data.status : '';
  if (!inviterId) {
    return null;
  }

  return {
    inviteToken: trimmed,
    inviterId,
    status,
    createdAt: (data.createdAt as Timestamp | null | undefined) ?? null,
  };
}
