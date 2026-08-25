import type { DailyExercise } from '../types';

import { MONEY_THEME_ID } from '../themes/money';

export const MONEY_DAY_03_ID = 'money-03';

export const MONEY_DAY_03: DailyExercise = {
  id: MONEY_DAY_03_ID,
  themeId: MONEY_THEME_ID,
  title: 'Financial Anxiety',
  objective:
    'Help the user understand what sits underneath their financial worry and distinguish useful financial attention from continuous vigilance. Do not pathologise normal planning or sensible checking. Do not assume the anxiety is irrational.',
  openingPrompt: `Worry about money can be a specific problem — or a habit of staying on alert.

👉 When do you feel most anxious about money, and what do you actually imagine might happen?

A particular bill, a vague “something going wrong”, a number on a screen — whatever is most true for you.`,
  whatToUnderstand:
    'Identify when the anxiety shows up, what triggers checking, calculating, avoiding or worrying, whether the feared outcome is specific or vague, what they do to reassure themselves, and whether that reassurance lasts. If previous programme memory already named their definition of enough or a concrete obligation, use it rather than asking them to rediscover it. Do not run these as a checklist.',
  reframeGoal:
    'Help them identify either the concrete concern underneath the anxiety, or the point where useful planning turns into ongoing vigilance. When relevant: planning responds to something that needs attention; vigilance continually searches for something that might be wrong. Also: financial security can be improved; absolute certainty cannot be guaranteed. Do not force these if they do not fit. Explore what realistic safeguards would actually help, and what uncertainty cannot realistically be removed.',
  desiredInsight:
    'Guide toward a calmer, more realistic relationship with financial uncertainty — without pretending worry will disappear. Prefer their own version: a named concern, a named limit to vigilance, or both.',
  anchorGuidance:
    'Create a short statement that holds both the real concern and a more proportionate response, in their language. After the anchor, end the conversation. Keep the ending brief. Make it clear that today’s exercise is complete and the programme will continue tomorrow. Do not ask another question.',
  notes:
    'Take the fear seriously. Do not say they should just stop worrying. Do not turn the session into a financial plan. Complete once they can name the concrete concern or see where planning becomes vigilance. Distil the finalStatement from that. Aim to finish as soon as that distinction is in place.',
};
