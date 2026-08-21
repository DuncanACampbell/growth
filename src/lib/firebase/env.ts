export type FirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
};

function readPublicEnv(value: string | undefined): string | undefined {
  if (typeof value !== 'string' || value.trim().length === 0) {
    return undefined;
  }
  return value.trim();
}

/**
 * Reads Firebase *web app* config from Expo public env vars.
 * These values are bundled into the client, so they are not secrets.
 * Still keep them out of Git and rotate them if they leak in a way that
 * enables abuse against an unlocked Firebase project.
 */
export function getFirebaseClientConfig(): FirebaseClientConfig | null {
  const apiKey = readPublicEnv(process.env.EXPO_PUBLIC_FIREBASE_API_KEY);
  const authDomain = readPublicEnv(process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN);
  const projectId = readPublicEnv(process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID);
  const storageBucket = readPublicEnv(process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET);
  const messagingSenderId = readPublicEnv(
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  );
  const appId = readPublicEnv(process.env.EXPO_PUBLIC_FIREBASE_APP_ID);

  if (
    !apiKey ||
    !authDomain ||
    !projectId ||
    !storageBucket ||
    !messagingSenderId ||
    !appId
  ) {
    return null;
  }

  return {
    apiKey,
    authDomain,
    projectId,
    storageBucket,
    messagingSenderId,
    appId,
  };
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseClientConfig() !== null;
}
