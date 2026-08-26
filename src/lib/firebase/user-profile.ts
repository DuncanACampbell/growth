import { doc, serverTimestamp, setDoc } from 'firebase/firestore';

import { getFirestoreDb } from './client';

type UserProfileWrite = {
  uid: string;
  email: string;
};

/**
 * Creates/merges users/{uid} on first Firebase sign-up.
 * Sets email, createdAt, and lastSeenAt (server timestamps).
 */
export async function createUserProfileOnSignUp({
  uid,
  email,
}: UserProfileWrite): Promise<void> {
  const ref = doc(getFirestoreDb(), 'users', uid);
  await setDoc(
    ref,
    {
      email,
      createdAt: serverTimestamp(),
      lastSeenAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * Merges users/{uid} on Firebase sign-in.
 * Updates email and lastSeenAt only so createdAt stays from the first write.
 */
export async function touchUserProfileOnSignIn({
  uid,
  email,
}: UserProfileWrite): Promise<void> {
  const ref = doc(getFirestoreDb(), 'users', uid);
  await setDoc(
    ref,
    {
      email,
      lastSeenAt: serverTimestamp(),
    },
    { merge: true },
  );
}
