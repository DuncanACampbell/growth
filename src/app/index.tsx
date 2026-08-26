import { Redirect } from 'expo-router';

import { getPostAuthHref } from '@/lib/onboarding';
import { useMockSession } from '@/lib/mock-session';

export default function Index() {
  const { isReady, isSignedIn, world } = useMockSession();
  if (!isReady) {
    return null;
  }
  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }
  return <Redirect href={getPostAuthHref(world)} />;
}
