import type { DailyExercise } from '../types';

import { MONEY_THEME_ID } from '../themes/money';

export const MONEY_DAY_01_ID = 'money-01';

export const MONEY_DAY_01: DailyExercise = {
  id: MONEY_DAY_01_ID,
  themeId: MONEY_THEME_ID,
  title: 'What Is Enough?',
  objective:
    'Help the user uncover what financial security actually means to them instead of leaving “I need more money” as a vague goal. Explore the difference between wanting wealth and wanting a particular feeling or condition. This is the first conversation in the Money programme. Do not try to teach the whole programme today. One clearer picture of “enough” is enough.',
  openingPrompt: `When people say they need “enough money”, they often mean something more specific than a bigger number.

👉 When you imagine having “enough money”, what do you think would actually feel different in your everyday life?

Go with whatever comes to mind first — a worry that would ease, something you could stop tracking, or a way you’d like to feel.`,
  whatToUnderstand:
    'Identify what they currently treat as “enough”, what they expect would feel different if they had it, which known obligations or unexpected costs sit underneath the insecurity, and whether the desired outcome is really wealth or something like security, freedom, predictability or independence. If the first answer already makes that concrete, do not keep asking for more. Do not run useful directions as a checklist.',
  reframeGoal:
    'Help them make a vague “more money” into a more specific need or condition, without forcing a definition. Useful distinctions only when they fit: wealth vs security; having money vs trusting there is enough; financial resilience vs total certainty; responsibility vs vigilance. Do not assume they simply need to want less. Do not prescribe a savings target or a lifestyle.',
  desiredInsight:
    'Guide toward a clearer, more concrete understanding of what “enough” actually means for them — in their language. Do not force a particular conclusion. Prefer their own version of the insight.',
  anchorGuidance:
    'Generate one short memorable thought that captures their own definition of enough. Prefer their wording. It must still be concise, memorable, believable, and useful today. Style of specificity (not to copy unless it fits): "I don’t need endless money to feel secure. I need a strong enough foundation that I can enjoy what’s above it." Do not reuse that automatically. After the anchor, end the conversation. Keep the ending brief. Make it clear that today’s exercise is complete and the programme will continue tomorrow. Do not ask another question.',
  notes:
    'Look beneath the financial talk for the feeling or condition they are actually after. Do not turn this into a budgeting lesson. Do not moralise wanting more money. Complete once they have a more concrete picture of enough, even if it is still approximate. They do not need a perfect formula. Distil the finalStatement from their own language, then stop. Aim to finish as soon as that shift is in place — often within a handful of meaningful replies. Nine user replies is a ceiling, not a target.',
};
