import { Redirect } from 'expo-router';

import { useMockSession } from '@/lib/mock-session';

export default function Index() {
  const { isReady, isSignedIn } = useMockSession();
  if (!isReady) {
    return null;
  }
  return <Redirect href={isSignedIn ? '/home' : '/login'} />;
}
