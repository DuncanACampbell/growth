import {
  growthOnboardingGradient,
  growthSignupGradient,
} from '@/theme/brand';

/** Soft Growth palette pairs for deterministic avatar washes. */
const AVATAR_GRADIENT_PAIRS: readonly (readonly [string, string])[] = [
  [growthSignupGradient[0], growthSignupGradient[1]],
  [growthSignupGradient[1], growthSignupGradient[2]],
  [growthSignupGradient[2], growthSignupGradient[3]],
  [growthSignupGradient[3], growthSignupGradient[4]],
  [growthOnboardingGradient[0], growthOnboardingGradient[1]],
  [growthOnboardingGradient[1], growthOnboardingGradient[2]],
  [growthSignupGradient[0], growthOnboardingGradient[2]],
  [growthSignupGradient[4], growthOnboardingGradient[1]],
];

function hashUid(uid: string): number {
  let hash = 0;
  for (let index = 0; index < uid.length; index += 1) {
    hash = (hash * 31 + uid.charCodeAt(index)) >>> 0;
  }
  return hash;
}

/** Stable two-stop gradient for a user's avatar placeholder. */
export function avatarGradientForUser(uid: string): [string, string] {
  const pair = AVATAR_GRADIENT_PAIRS[hashUid(uid) % AVATAR_GRADIENT_PAIRS.length]!;
  return [pair[0], pair[1]];
}
