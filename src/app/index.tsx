import { Redirect } from 'expo-router';

import { useMockSession } from '@/lib/mock-session';

export default function Index() {
  const { isSignedIn } = useMockSession();
  return <Redirect href={isSignedIn ? '/home' : '/login'} />;
}
