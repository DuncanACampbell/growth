/**
 * Brand atmosphere gradients shared by Signup and Onboarding.
 * Signup uses the saturated stops; onboarding uses a soft light coral wash.
 */

/** Expressive signup / login gradient. */
export const growthSignupGradient = [
  '#D86B6E',
  '#E88A9A',
  '#B397E8',
  '#90B9E9',
  '#88CBB0',
] as const;

/**
 * Full-screen onboarding wash — soft warm coral / blush / peach.
 * Same family as signup coral, but light enough to sit between Signup and Home.
 */
export const growthOnboardingGradient = [
  '#F6B6B8', // soft coral blush (upper)
  '#FAD1C8', // peach-coral (centre)
  '#FBE4D8', // warm light peach (lower)
] as const;

/** Deeper coral from the signup palette — progress, focus, selection. */
export const growthBrandAccent = '#D86B6E';

/** Soft fill for selected chips on the pastel wash. */
export const growthBrandAccentSoft = '#E89294';
