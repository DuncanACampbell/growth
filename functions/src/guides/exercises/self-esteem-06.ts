import type { DailyExercise } from '../types';

import { SELF_ESTEEM_THEME_ID } from '../themes/self-esteem';

export const SELF_ESTEEM_DAY_06_ID = 'self-esteem-06';

export const SELF_ESTEEM_DAY_06: DailyExercise = {
  id: SELF_ESTEEM_DAY_06_ID,
  themeId: SELF_ESTEEM_THEME_ID,
  title: 'What You Respect About Yourself',
  objective:
    'Shift from examining threats to self-esteem toward identifying an internally valued quality. Help the user name something they genuinely admire or respect about themselves that is not dependent primarily on achievement, usefulness, praise, recognition, being liked, or helping someone else. The exercise should produce intrinsic self-respect rather than generic positive affirmation.',
  openingPrompt: `Today I want to turn the question around.

👉 **What's something about yourself that you genuinely admire — not because it benefits other people or because you're good at it, but because you respect it in yourself?**

Think about the way you think, the way you face life, your values, or the kind of person you are becoming.

Go with whatever feels most genuinely yours.`,
  whatToUnderstand:
    'Identify the quality and why they value it. If the answer is actually an achievement, role or useful behaviour, gently look underneath it for the characteristic it demonstrates. Examples: helping friends → loyalty, care, generosity; building a company → courage, ambition, persistence, creativity; academic success → curiosity, discipline, love of learning. Do not impose a quality they do not recognise.',
  reframeGoal:
    'Test whether the quality remains meaningful if external rewards disappear. Explore, only where it fits their answer, whether they would still respect this part of themselves if nobody praised it, nobody noticed, it did not help their career, it did not make people like them, or they temporarily stopped succeeding.',
  desiredInsight:
    'Guide toward something broadly equivalent to: there are qualities I genuinely respect in myself that don\'t need external approval to exist. Prefer the user\'s own version.',
  anchorGuidance:
    'Build the statement directly from the quality they discovered. Style examples (do not copy if their language is better): "I respect that I keep trying even when nobody is rewarding me for it." / "My curiosity belongs to me. It doesn\'t need a grade or a title to count." / "I care because it\'s part of my character, not because somebody is watching." Avoid generic lines such as "I have many wonderful qualities." After the anchor, end the conversation. Keep the ending brief. Make it clear that today\'s exercise is complete and the programme will continue tomorrow. Do not ask another question.',
  notes:
    'Take positive answers seriously. Do not automatically dilute them with "but." If they identify a quality supported by their own evidence, confidently reflect it back. Avoid excessive praise. Explain why the quality is internally grounded. When they establish that it is internally meaningful, let that land. This should feel affirming: they have spent several days examining harsh judgments, and today is about constructing a more stable source of self-respect. Distil the finalStatement from the quality they named.',
};
