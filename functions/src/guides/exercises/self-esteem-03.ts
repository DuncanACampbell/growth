import type { DailyExercise } from '../types';

import { SELF_ESTEEM_THEME_ID } from '../themes/self-esteem';

export const SELF_ESTEEM_DAY_03_ID = 'self-esteem-03';

export const SELF_ESTEEM_DAY_03: DailyExercise = {
  id: SELF_ESTEEM_DAY_03_ID,
  themeId: SELF_ESTEEM_THEME_ID,
  title: 'Comparison',
  objective:
    "Help the user identify one specific comparison that makes them feel worse about themselves. The aim is not to convince them that comparison is bad or that they should stop noticing other people's strengths. Help them recognise when someone else's attractiveness, success, intelligence, confidence, lifestyle or another quality is being converted into evidence against themselves.",
  openingPrompt: `Most of us have someone who can make us feel a little smaller just by comparing ourselves with them.

👉 **Who is someone you sometimes compare yourself to and come away feeling worse about yourself? What is it about them that gets to you?**

Pick one real person or type of person that comes to mind.`,
  whatToUnderstand:
    'Identify who or what they compare themselves with, the quality they envy, admire or feel threatened by, what conclusion they draw about themselves because the other person has it, and whether the comparison is a specific difference or a global judgment of worth. Do not ask these as a checklist.',
  reframeGoal:
    'Help them separate "What do they have?" from "What am I making that mean about me?" When useful, explore whether they can admire, envy or want something another person has without treating that person as evidence against themselves. Avoid leading questions that already contain the intended answer. Do not dismiss the other person\'s strength with lines such as "They probably have problems too" or "Social media isn\'t real." Their advantage may be completely real. The useful distinction is: their strength can be true without the user\'s deficiency automatically following from it. For example, "They\'re very attractive" does not logically require "So I\'m unattractive."',
  desiredInsight:
    'Guide toward something broadly equivalent to: someone else having something I value does not automatically make me lesser. Prefer the user\'s own version.',
  anchorGuidance:
    'Create a personalised statement grounded in the specific comparison. Style examples (do not copy if their language is better): "Their success is information about their life, not a verdict on mine." / "I can notice his attractiveness without using it as evidence against my own." / "Someone else\'s strength doesn\'t subtract from me." After the anchor, end the conversation. Keep the ending brief. Make it clear that today\'s exercise is complete and the programme will continue tomorrow. Do not ask another question.',
  notes:
    'Acknowledge that comparison can genuinely sting. Do not try to make comparison disappear. When they separate the other person\'s quality from a verdict on themselves, reinforce that they can still want what the other person has. Complete once that distinction is in place. Distil the finalStatement from their own language and the specific comparison they named.',
};
