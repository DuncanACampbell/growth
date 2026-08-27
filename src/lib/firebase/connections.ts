import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from 'firebase/firestore';

import { getFirestoreDb } from './client';
import { logTechnicalError } from '@/lib/errors/user-facing';

export type ConnectionRecord = {
  id: string;
  userIds: [string, string];
  createdAt: Timestamp | null;
  createdBy: string;
};

export type UserPublicProfile = {
  uid: string;
  displayName: string | null;
  email: string | null;
};

export type CircleMember = {
  connectionId: string;
  userId: string;
  displayLabel: string;
};

const CONNECTIONS_COLLECTION = 'connections';
const USERS_COLLECTION = 'users';

/** Stable id for a pair so the same two users only ever get one document. */
export function connectionDocumentId(uidA: string, uidB: string): string {
  return [uidA, uidB].slice().sort().join('_');
}

function sortedUserIds(uidA: string, uidB: string): [string, string] {
  const sorted = [uidA, uidB].slice().sort();
  return [sorted[0]!, sorted[1]!];
}

/**
 * Human-readable label for a Circle row.
 * Prefers displayName, then email local-part, then a safe fallback.
 */
export function displayLabelForUser(profile: UserPublicProfile): string {
  const name = profile.displayName?.trim();
  if (name) {
    return name;
  }
  const email = profile.email?.trim();
  if (email) {
    const local = email.split('@')[0]?.trim();
    if (local) {
      return local;
    }
  }
  return 'Someone on Growth';
}

export async function getUserPublicProfile(
  uid: string,
): Promise<UserPublicProfile> {
  const snap = await getDoc(doc(getFirestoreDb(), USERS_COLLECTION, uid));
  if (!snap.exists()) {
    return { uid, displayName: null, email: null };
  }
  const data = snap.data();
  return {
    uid,
    displayName:
      typeof data.displayName === 'string' ? data.displayName : null,
    email: typeof data.email === 'string' ? data.email : null,
  };
}

/**
 * Creates a mutual connection between two users, or no-ops if it already exists.
 * Document id is deterministic from the sorted UID pair.
 *
 * Duplicate check uses the caller's connection list (allowed by rules) instead of
 * a transactional get on a missing doc, which security rules reject.
 */
export async function createConnection(input: {
  currentUserId: string;
  otherUserId: string;
}): Promise<{ connectionId: string; created: boolean }> {
  const currentUserId = input.currentUserId.trim();
  const otherUserId = input.otherUserId.trim();

  if (!currentUserId) {
    throw new Error('You need to be signed in to create a connection.');
  }
  if (!otherUserId) {
    throw new Error('Enter another user’s Firebase UID.');
  }
  if (currentUserId === otherUserId) {
    throw new Error('You cannot connect with yourself.');
  }

  const userIds = sortedUserIds(currentUserId, otherUserId);
  const connectionId = connectionDocumentId(currentUserId, otherUserId);
  const existing = await listConnectionsForUser(currentUserId);
  if (existing.some((item) => item.userIds.includes(otherUserId))) {
    return { connectionId, created: false };
  }

  const ref = doc(getFirestoreDb(), CONNECTIONS_COLLECTION, connectionId);
  try {
    await setDoc(ref, {
      userIds,
      createdAt: serverTimestamp(),
      createdBy: currentUserId,
    });
    return { connectionId, created: true };
  } catch (caught) {
    logTechnicalError('connections.create', caught);
    const code =
      caught && typeof caught === 'object' && 'code' in caught
        ? String((caught as { code?: string }).code ?? '')
        : '';
    if (code === 'permission-denied') {
      // Existing doc → update is denied by rules; treat as already connected.
      const after = await listConnectionsForUser(currentUserId);
      if (after.some((item) => item.userIds.includes(otherUserId))) {
        return { connectionId, created: false };
      }
      throw new Error(
        'Firestore blocked this connection. Publish the latest firestore.rules, then try again.',
      );
    }
    throw caught instanceof Error
      ? caught
      : new Error('Couldn’t create that connection.');
  }
}

/**
 * Deletes the single mutual connection document for a pair of users.
 * Uses the deterministic connection id; does not touch user profiles.
 */
export async function removeConnection(input: {
  currentUserId: string;
  otherUserId: string;
}): Promise<void> {
  const currentUserId = input.currentUserId.trim();
  const otherUserId = input.otherUserId.trim();

  if (!currentUserId) {
    throw new Error('You need to be signed in to update your Circle.');
  }
  if (!otherUserId) {
    throw new Error('Missing connection to remove.');
  }
  if (currentUserId === otherUserId) {
    throw new Error('You cannot remove yourself from your Circle.');
  }

  const connectionId = connectionDocumentId(currentUserId, otherUserId);
  const ref = doc(getFirestoreDb(), CONNECTIONS_COLLECTION, connectionId);

  try {
    await deleteDoc(ref);
  } catch (caught) {
    logTechnicalError('connections.remove', caught);
    const code =
      caught && typeof caught === 'object' && 'code' in caught
        ? String((caught as { code?: string }).code ?? '')
        : '';
    if (code === 'permission-denied') {
      throw new Error(
        'Firestore blocked this removal. Publish the latest firestore.rules, then try again.',
      );
    }
    throw caught instanceof Error
      ? caught
      : new Error('Couldn’t remove that person from your Circle.');
  }
}

/** All connection docs that include this user in `userIds`. */
export async function listConnectionsForUser(
  userId: string,
): Promise<ConnectionRecord[]> {
  const q = query(
    collection(getFirestoreDb(), CONNECTIONS_COLLECTION),
    where('userIds', 'array-contains', userId),
  );
  const snap = await getDocs(q);

  return snap.docs.flatMap((item) => {
    const data = item.data();
    const rawIds = Array.isArray(data.userIds) ? data.userIds : [];
    const userIds = rawIds.filter(
      (value): value is string =>
        typeof value === 'string' && value.trim().length > 0,
    );
    if (userIds.length !== 2) {
      return [];
    }
    return [
      {
        id: item.id,
        userIds: [userIds[0]!, userIds[1]!] as [string, string],
        createdAt: (data.createdAt as Timestamp | null | undefined) ?? null,
        createdBy: typeof data.createdBy === 'string' ? data.createdBy : '',
      } satisfies ConnectionRecord,
    ];
  });
}

/**
 * Connections for the signed-in user, resolved to the other person + label.
 */
export async function listCircleMembers(
  currentUserId: string,
): Promise<CircleMember[]> {
  const connections = await listConnectionsForUser(currentUserId);
  const members = await Promise.all(
    connections.map(async (connection) => {
      const otherUserId =
        connection.userIds.find((id) => id !== currentUserId) ??
        connection.userIds[0] ??
        '';
      if (!otherUserId) {
        return null;
      }
      const profile = await getUserPublicProfile(otherUserId);
      return {
        connectionId: connection.id,
        userId: otherUserId,
        displayLabel: displayLabelForUser(profile),
      } satisfies CircleMember;
    }),
  );

  return members
    .filter((member): member is CircleMember => member !== null)
    .sort((a, b) => a.displayLabel.localeCompare(b.displayLabel));
}
