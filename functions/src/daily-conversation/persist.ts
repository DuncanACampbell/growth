import { getApps, initializeApp } from 'firebase-admin/app';
import { FieldValue, getFirestore, type Firestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';

import {
  parseStoredDailyConversationMemory,
  type DailyConversationMemory,
} from './memory';

const COLLECTION = 'dailyConversations';

function getDb(): Firestore {
  if (getApps().length === 0) {
    initializeApp();
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

export async function getMostRecentPreviousDailyConversationMemory(input: {
  uid: string;
  localDate: string;
}): Promise<DailyConversationMemory | null> {
  const db = getDb();
  try {
    const snapshot = await db
      .collection(collectionPath(input.uid))
      .where('date', '<', input.localDate)
      .orderBy('date', 'desc')
      .limit(1)
      .get();
    const doc = snapshot.docs[0];
    if (!doc) {
      return null;
    }
    const data = doc.data();
    return parseStoredDailyConversationMemory(data.memory);
  } catch (caught) {
    logger.error('Failed to load previous Daily Conversation memory.', {
      uid: input.uid,
      error: caught instanceof Error ? caught.message : String(caught),
    });
    return null;
  }
}
