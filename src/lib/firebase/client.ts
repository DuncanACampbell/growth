import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import * as FirebaseAuth from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getFunctions, type Functions } from 'firebase/functions';
import { getStorage, type FirebaseStorage } from 'firebase/storage';
import { Platform } from 'react-native';

import { getFirebaseClientConfig } from './env';

const { getAuth, initializeAuth } = FirebaseAuth;
type Auth = FirebaseAuth.Auth;
type Persistence = FirebaseAuth.Persistence;

/**
 * Firebase's public `firebase/auth` types target the web entry and omit
 * `getReactNativePersistence`. Metro still resolves the RN Auth bundle, where
 * the helper exists at runtime.
 */
function getReactNativePersistence(
  storage: typeof AsyncStorage,
): Persistence {
  const { getReactNativePersistence: createNativePersistence } =
    FirebaseAuth as typeof FirebaseAuth & {
      getReactNativePersistence: (storage: typeof AsyncStorage) => Persistence;
    };

  return createNativePersistence(storage);
}

let auth: Auth | undefined;
let firestore: Firestore | undefined;
let storage: FirebaseStorage | undefined;
let functions: Functions | undefined;

function requireApp(): FirebaseApp {
  const config = getFirebaseClientConfig();
  if (!config) {
    throw new Error(
      'Firebase is not configured. Copy .env.example to .env and fill in the EXPO_PUBLIC_FIREBASE_* values.',
    );
  }

  if (getApps().length > 0) {
    return getApp();
  }

  return initializeApp(config);
}

export function getFirebaseApp(): FirebaseApp {
  return requireApp();
}

export function getFirebaseAuth(): Auth {
  if (auth) {
    return auth;
  }

  const app = requireApp();

  if (Platform.OS === 'web') {
    auth = getAuth(app);
    return auth;
  }

  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch {
    // Fast Refresh can re-run this module after Auth is already created.
    auth = getAuth(app);
  }

  return auth;
}

export function getFirestoreDb(): Firestore {
  if (!firestore) {
    firestore = getFirestore(requireApp());
  }
  return firestore;
}

export function getFirebaseStorage(): FirebaseStorage {
  if (!storage) {
    storage = getStorage(requireApp());
  }
  return storage;
}

/** Callable Cloud Functions against the deployed project (never a local emulator). */
export function getFirebaseFunctions(): Functions {
  if (functions) {
    return functions;
  }

  const region =
    process.env.EXPO_PUBLIC_FIREBASE_FUNCTIONS_REGION?.trim() || 'us-central1';
  functions = getFunctions(requireApp(), region);
  return functions;
}
