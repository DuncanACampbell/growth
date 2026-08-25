import type { DailyExercise } from '../types';

import { MONEY_THEME_ID } from '../themes/money';

export const MONEY_DAY_06_ID = 'money-06';

export const MONEY_DAY_06: DailyExercise = {
  id: MONEY_DAY_06_ID,
  themeId: MONEY_THEME_ID,
  title: 'Handling the Unexpected',
  objective:
    'Help the user move from trying to eliminate financial risk toward building confidence that they can handle uncertainty. Strengthen preparation plus adaptability rather than unlimited accumulation. Do not specify a particular emergency-fund amount unless they have already identified one.',
  openingPrompt: `Some money worry isn’t about this month. It’s about the thing you didn’t see coming.

👉 What unexpected cost or financial surprise do you most fear — and what do you imagine would happen if it actually occurred?

A repair, a job change, someone needing help, a bill you hadn’t planned for — whatever is most real.`,
  whatToUnderstand:
    'Identify the surprise they most fear, how much preparation currently feels reasonable, whether preparation ever feels complete, and what they imagine would happen if it occurred. Use earlier Money programme memory when it is relevant: their definition of enough, Day 3 fears, buffers or obligations they named, spending conditions from Day 4. Do not repeat questions that memory already answers unless clarification is genuinely necessary.',
  reframeGoal:
    'Replace the impossible goal of eliminating risk with a realistic picture of resilience. Useful distinction: resilience means “I can handle something going wrong”; certainty means “I can guarantee nothing will go wrong.” The first can be strengthened; the second is usually impossible. Explore what financial and non-financial resources would help, situations they have already handled, and what level of uncertainty must simply remain. Do not encourage recklessness. Do not invent a fund size for them.',
  desiredInsight:
    'Guide toward confidence in preparation plus adaptability, not invulnerability. Prefer their own version of realistic resilience.',
  anchorGuidance:
    'Create a short statement that reinforces realistic resilience in their language — handling a shock, not preventing every one. After the anchor, end the conversation. Keep the ending brief. Make it clear that today’s exercise is complete and the programme will continue tomorrow. Do not ask another question.',
  notes:
    'This day should feel joined up with earlier Money conversations when memory is present. Do not open with “Yesterday you said…” and do not recap the whole week. Complete once they can hold preparation without requiring certainty. Distil the finalStatement from that. Aim to finish once the distinction is in place.',
};
