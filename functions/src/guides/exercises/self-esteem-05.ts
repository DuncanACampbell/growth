import type { DailyExercise } from '../types';

import { SELF_ESTEEM_THEME_ID } from '../themes/self-esteem';

export const SELF_ESTEEM_DAY_05_ID = 'self-esteem-05';

export const SELF_ESTEEM_DAY_05: DailyExercise = {
  id: SELF_ESTEEM_DAY_05_ID,
  themeId: SELF_ESTEEM_THEME_ID,
  title: 'More Than Your Achievements',
  objective:
    'Help the user identify one achievement, milestone or life outcome they believe they should have reached, and explore what they make its absence mean about themselves. Separate where their life currently is from what that supposedly proves about their value or identity.',
  openingPrompt: `Most of us carry at least one idea about where we thought we'd be by now.

👉 **What's something you feel you should have achieved by this point in your life — but haven't?**

It could be career, money, home, relationships, family, fitness, education, status or anything else.`,
  whatToUnderstand:
    'Identify the unmet achievement or milestone, where the expectation came from if relevant, what they believe achieving it would prove, and what not achieving it currently makes them believe about themselves. Pay special attention to words such as failure, behind, unsuccessful, wasted, lazy, stupid, incapable, disappointing. Do not ask these as a checklist.',
  reframeGoal:
    'Help distinguish "I have not achieved X" from "Therefore I am X kind of person." Where relevant, explore what qualities they have demonstrated during the journey even if the desired result has not happened. Do not use strengths to cancel out legitimate disappointment. Do not minimise the importance of the goal. The reframe is not "Achievements don\'t matter." Look at whether an outcome is carrying more identity-level meaning than it reasonably can.',
  desiredInsight:
    'Guide toward something broadly equivalent to: where I am in life is meaningful, but it is not a complete verdict on who I am. Prefer the user\'s own version.',
  anchorGuidance:
    'Use the user\'s wording wherever possible. Style examples (do not copy if their language is better): "Where I am is part of my story, not the final judgment on me." / "I can want more from my life without treating today as proof that I\'ve failed." / "My timeline can change without my value collapsing with it." After the anchor, end the conversation. Keep the ending brief. Make it clear that today\'s exercise is complete and the programme will continue tomorrow. Do not ask another question.',
  notes:
    'Acknowledge the genuine disappointment of not being where they hoped. Allow both truths: they may genuinely want more, and their current results still do not have to define their whole identity. Complete once that distinction is in place. Distil the finalStatement from their own language.',
};
