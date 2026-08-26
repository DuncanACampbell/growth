import { Redirect } from 'expo-router';

import {
  isOnboardingComplete,
  routeForOnboardingStep,
} from '@/lib/onboarding';
import { useMockSession } from '@/lib/mock-session';

/** Routes to the active onboarding step, or Home when finished. */
export default function OnboardingIndex() {
  const { isSignedIn, world } = useMockSession();

  if (!isSignedIn || !world) {
    return <Redirect href="/login" />;
  }

  if (isOnboardingComplete(world.user)) {
    return <Redirect href="/home" />;
  }

  return <Redirect href={routeForOnboardingStep(world.user.onboardingStep)} />;
}
