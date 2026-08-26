import type { Href } from 'expo-router';

import { getCatalogueThemes, type MockWorld } from '@/data/mock';
import type { OnboardingStep, User } from '@/types/models';

/** After name, continue to theme-interest selection. */
export function nextOnboardingStepAfterName(): OnboardingStep {
  return 'themes';
}

export function isOnboardingComplete(user: User): boolean {
  return user.onboardingStep === 'complete';
}

export function needsOnboarding(user: User): boolean {
  return !isOnboardingComplete(user);
}

/** True while the user may still edit their name (name step or themes step). */
export function canEditOnboardingName(user: User): boolean {
  return user.onboardingStep === 'name' || user.onboardingStep === 'themes';
}

/** Route for the user's current onboarding step. */
export function routeForOnboardingStep(step: OnboardingStep): Href {
  switch (step) {
    case 'name':
      return '/onboarding/name';
    case 'themes':
      return '/onboarding/themes';
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

/** Keep only known catalogue theme IDs (deduped, stable order from catalogue). */
export function sanitizeInterestedThemeIds(themeIds: string[]): string[] {
  const allowed = new Set(getCatalogueThemes().map((theme) => theme.id));
  const selected = new Set(themeIds.filter((id) => allowed.has(id)));
  return getCatalogueThemes()
    .map((theme) => theme.id)
    .filter((id) => selected.has(id));
}
