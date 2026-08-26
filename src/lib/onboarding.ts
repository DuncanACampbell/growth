import type { Href } from 'expo-router';

import type { MockWorld } from '@/data/mock';
import type { OnboardingStep, User } from '@/types/models';

/**
 * Temporary: after name, skip ahead to complete until theme-interest exists.
 * Change this to return `'themes'` when that screen ships.
 */
export function nextOnboardingStepAfterName(): OnboardingStep {
  return 'complete';
}

export function isOnboardingComplete(user: User): boolean {
  return user.onboardingStep === 'complete';
}

export function needsOnboarding(user: User): boolean {
  return !isOnboardingComplete(user);
}

/** Route for the user's current onboarding step (never `/home`). */
export function routeForOnboardingStep(step: OnboardingStep): Href {
  switch (step) {
    case 'name':
      return '/onboarding/name';
    case 'complete':
      return '/home';
  }
}

/** Where a signed-in user should land after auth or app boot. */
export function getPostAuthHref(world: MockWorld): Href {
  if (needsOnboarding(world.user)) {
    return routeForOnboardingStep(world.user.onboardingStep);
  }
  return '/home';
}
