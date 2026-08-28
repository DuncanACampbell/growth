import { getApps, initializeApp } from 'firebase-admin/app';
import {
  FieldPath,
  FieldValue,
  getFirestore,
  type Firestore,
} from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import {
  parseStoredDailyConversationMemory,
  type DailyConversationMemory,
} from './memory';

const COLLECTION = 'dailyConversations';

export type PreviousMemoryLookupStatus =
  | 'found'
  | 'not-found'
  | 'ignored-invalid';

export type TodayDocumentLookupStatus =
  | 'found'
  | 'not-found'
  | 'ignored-invalid';

function getDb(): Firestore {
  if (getApps().length === 0) {
    try {
      initializeApp();
    } catch (caught) {
      if (getApps().length === 0) {
        throw caught;
      }
    }
  }
  return getFirestore();
}

function collectionPath(uid: string) {
  return `users/${uid}/${COLLECTION}`;
}

export async function saveCompletedDailyConversationMemory(input: {
  uid: string;
  localDate: string;
  memory: DailyConversationMemory;
}): Promise<void> {
  const db = getDb();
  await db.doc(`${collectionPath(input.uid)}/${input.localDate}`).set({
    version: 1,
    date: input.localDate,
    completedAt: FieldValue.serverTimestamp(),
    memory: input.memory,
  });
}

export async function getDailyConversationFinalThoughtForDate(input: {
  uid: string;
  localDate: string;
}): Promise<string | null> {
  const db = getDb();
  const snapshot = await db.doc(`${collectionPath(input.uid)}/${input.localDate}`).get();
  if (!snapshot.exists) {
    return null;
  }
  const stored = snapshot.data()?.memory;
  const parsed = parseStoredDailyConversationMemory(stored);
  const fromParsed = parsed?.finalThought.trim() ?? '';
  if (fromParsed) {
    return fromParsed;
  }
  return readStoredFinalThought(stored);
}

export function readStoredFinalThought(value: unknown): string | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const thought = (value as { finalThought?: unknown }).finalThought;
  if (typeof thought !== 'string') {
    return null;
  }
  const trimmed = thought.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function peekTodaysDailyConversationDocument(input: {
  uid: string;
  localDate: string;
}): Promise<TodayDocumentLookupStatus> {
  try {
    const db = getDb();
    const snapshot = await db
      .doc(`${collectionPath(input.uid)}/${input.localDate}`)
      .get();
    if (!snapshot.exists) {
      return 'not-found';
    }
    const parsed = parseStoredDailyConversationMemory(snapshot.data()?.memory);
    if (!parsed) {
      logger.warn(
        '[DailyConversationOpening] today document exists but memory is invalid; ignoring',
      );
      return 'ignored-invalid';
    }
    return 'found';
  } catch (caught) {
    logger.warn(
      '[DailyConversationOpening] today document lookup failed; continuing with fresh opening',
      {
        error: caught instanceof Error ? caught.message : String(caught),
      },
    );
    return 'ignored-invalid';
  }
}

export async function getMostRecentPreviousDailyConversationMemory(input: {
  uid: string;
  localDate: string;
}): Promise<{
  status: PreviousMemoryLookupStatus;
  memory: DailyConversationMemory | null;
}> {
  try {
    const db = getDb();
    // Document IDs are YYYY-MM-DD, so lexicographic order matches calendar order.
    // This avoids a composite index on `date`.
    const snapshot = await db
      .collection(collectionPath(input.uid))
      .where(FieldPath.documentId(), '<', input.localDate)
      .orderBy(FieldPath.documentId(), 'desc')
      .limit(1)
      .get();
    const doc = snapshot.docs[0];
    if (!doc) {
      return { status: 'not-found', memory: null };
    }
    const parsed = parseStoredDailyConversationMemory(doc.data()?.memory);
    if (!parsed) {
      logger.warn(
        '[DailyConversationOpening] previous memory document ignored as invalid',
      );
      return { status: 'ignored-invalid', memory: null };
    }
    return { status: 'found', memory: parsed };
  } catch (caught) {
    logger.warn(
      '[DailyConversationOpening] previous memory lookup failed; continuing with fresh opening',
      {
        error: caught instanceof Error ? caught.message : String(caught),
      },
    );
    return { status: 'ignored-invalid', memory: null };
  }
}
