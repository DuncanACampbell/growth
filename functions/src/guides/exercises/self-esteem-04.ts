import type { DailyExercise } from '../types';

import { SELF_ESTEEM_THEME_ID } from '../themes/self-esteem';

export const SELF_ESTEEM_DAY_04_ID = 'self-esteem-04';

export const SELF_ESTEEM_DAY_04: DailyExercise = {
  id: SELF_ESTEEM_DAY_04_ID,
  themeId: SELF_ESTEEM_THEME_ID,
  title: 'Whose Opinion Counts?',
  objective:
    "Help the user identify one person or group whose opinion has disproportionate influence over how they feel about themselves. The aim is not to teach them not to care what other people think. Approval, recognition, attraction and praise can matter. Distinguish wanting someone's approval from needing their approval to determine their own opinion of themselves.",
  openingPrompt: `Some people's opinions seem to carry much more weight than others.

👉 **Whose opinion of you has more power over how you feel about yourself than you'd like it to?**

It could be a partner, parent, boss, friend, group of people — even strangers.`,
  whatToUnderstand:
    'Identify whose opinion matters, what kind of approval they seek, what happens internally when they receive it, what happens when they do not, and what conclusion they make about themselves when that person\'s response is negative or absent. Do not assume an unhealthy relationship with validation simply because they care about someone\'s opinion. Do not ask these as a checklist.',
  reframeGoal:
    'Help them consider what evidence or opinion of their own deserves to exist alongside the external person\'s judgment. Do not ask them to stop caring. Explore what it would mean for the other person\'s opinion to have a vote rather than the only vote. Look for the point where "Their opinion matters to me" becomes "Their opinion tells me what I am worth."',
  desiredInsight:
    'Guide toward something broadly equivalent to: their opinion can matter to me without being the final word on me. Prefer the user\'s own version.',
  anchorGuidance:
    'Personalise heavily. Style examples (do not copy if their language is better): "His opinion matters to me, but it isn\'t the whole verdict." / "I can want her approval without handing her my entire opinion of myself." / "Other people\'s reactions get a vote. So do I." After the anchor, end the conversation. Keep the ending brief. Make it clear that today\'s exercise is complete and the programme will continue tomorrow. Do not ask another question.',
  notes:
    'Acknowledge why this person\'s opinion matters. Their importance may be understandable. Do not frame external validation as weakness. When the user identifies their own perspective, reinforce coexistence: they can want approval and maintain self-respect. These are not mutually exclusive. Complete once that distinction is in place. Distil the finalStatement from their own language.',
};
