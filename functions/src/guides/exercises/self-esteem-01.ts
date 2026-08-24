import type { DailyExercise } from '../types';

import { SELF_ESTEEM_THEME_ID } from '../themes/self-esteem';

export const SELF_ESTEEM_DAY_01_ID = 'self-esteem-01';

export const SELF_ESTEEM_DAY_01: DailyExercise = {
  id: SELF_ESTEEM_DAY_01_ID,
  themeId: SELF_ESTEEM_THEME_ID,
  title: 'The Harsher Judge',
  objective:
    "Help the user identify one part of themselves that they judge particularly harshly and begin recognising that their judgment is a perspective rather than an objective fact. This is the user's first conversation in the Self Esteem programme. Do not try to teach them everything about self-esteem today. One meaningful shift is enough.",
  openingPrompt: `Let's start with something you probably already know about yourself.

👉 What's one part of yourself that you think you judge more harshly than other people probably do?

It could be something about how you look, your personality, your abilities, your past, or where you are in life.

Just go with whatever comes to mind first.`,
  whatToUnderstand:
    "Identify what the user is judging and, more importantly, what judgment they are making about it. If the answer is already clear, do not unnecessarily ask for more information. If needed, ask one short follow-up to understand whichever is most relevant: what specifically bothers them, what they tell themselves about it, what standard they believe they are failing to meet, where that standard may come from, or how they imagine other people see the same thing. Do not run through these as a checklist.",
  reframeGoal:
    'Help the user compare the standard they apply to themselves with the standard they would apply to another person. Do not simply ask a mechanical "Would you say that to a friend?" Use their specific situation. Help them consider whether they are treating a preference as a requirement, an imperfection as a defect, a mistake as a character judgment, a difference as a deficiency, a temporary situation as an identity, or an unmet expectation as evidence of failure. Where possible, ask a question that lets them discover the discrepancy themselves.',
  desiredInsight:
    "Guide toward something broadly equivalent to: the way I judge this part of myself isn't simply a fact; I'm applying a standard and interpreting myself through it — and that standard may be harsher than the one I would use for somebody else. Do not force the user to repeat this idea. Do not present this exact wording unless it naturally fits. Prefer the user's own version of the insight.",
  anchorGuidance:
    'Generate one short memorable thought for the next 24 hours. It must relate specifically to the issue the user discussed. Use their language whenever possible. It should help them notice or challenge the same harsh judgment when it appears again. Style examples: "My body doesn\'t have to meet my harshest standard to be okay." / "Being somewhere different from where I expected doesn\'t mean I\'m behind." / "One awkward moment doesn\'t define how good I am with people." Do not use generic affirmations such as "I am worthy", "I am enough", or "I love myself." After the anchor, end the conversation. Keep the ending brief. Make it clear that today\'s exercise is complete and the programme will continue tomorrow. Do not ask another question.',
  notes:
    'Support and interpretation: acknowledge why this particular issue affects them. Do not immediately contradict their judgment. If they say "I hate my body", do not respond "I\'m sure you look great." The purpose is not to prove the concern is false. Notice the severity, standard, or meaning in their self-judgment, based on what they actually said. When they recognise the discrepancy, reinforce it and stop. Do not dig for another insecurity. Being fairer to themselves does not require pretending the original issue does not exist. Complete the session once the user broadly recognises that their harsh self-judgment is an interpretation, that they are harsher on themselves than they would be on someone else, and that a mistake or setback need not become a global verdict on who they are. They do not need to state all three perfectly. If they have already accepted a reframe (for example, that they would treat a friend more kindly), do not repeat that technique. Close with a personalised one-sentence thought for today, then stop.',
};
