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
    'Help the user compare the standard they apply to themselves with the standard they would apply to another person. Do not simply ask a mechanical "Would you say that to a friend?" Do not put the intended answer in the question (avoid "Would you judge them as harshly as you judge yourself?"). Use their specific situation and ask an open comparison, for example what they would think it said about a close friend who had the same pattern and sometimes got it wrong. Help them consider whether they are treating a preference as a requirement, an imperfection as a defect, a mistake as a character judgment, a difference as a deficiency, a temporary situation as an identity, or an unmet expectation as evidence of failure. Let them discover the discrepancy themselves.',
  desiredInsight:
    "Guide toward something broadly equivalent to: the way I judge this part of myself isn't simply a fact; I'm applying a standard and interpreting myself through it — and that standard may be harsher than the one I would use for somebody else. Do not force the user to repeat this idea. Do not present this exact wording unless it naturally fits. Prefer the user's own version of the insight.",
  anchorGuidance:
    'Generate one short memorable thought for the next 24 hours by distilling the user\'s own final reframe. Prefer their wording. If they concluded they are making mistakes, noticing them, and slowly getting better, the statement should preserve that — not swap in an unrelated wellness line. It must still be concise, memorable, believable, and useful today. Style of specificity (not to copy unless they fit): "My body doesn\'t have to meet my harshest standard to be okay." / "This isn\'t who I am forever. I\'m making mistakes, noticing them, and slowly getting better." Do not use generic affirmations such as "I am worthy", "I am enough", or "I love myself." After the anchor, end the conversation. Keep the ending brief. Make it clear that today\'s exercise is complete and the programme will continue tomorrow. Do not ask another question.',
  notes:
    'Support and interpretation: acknowledge why this particular issue affects them. Do not immediately contradict their judgment. If they say "I hate my body", do not respond "I\'m sure you look great." The purpose is not to prove the concern is false. Notice the severity, standard, or meaning in their self-judgment, based on what they actually said. Interpret only one step beyond the evidence. Do not invent motives such as needing approval, abandonment, validation, control or insecurity unless they said something that supports that. When they recognise the discrepancy, reinforce it and stop. Do not dig for another insecurity. Being fairer to themselves does not require pretending the original issue does not exist. Complete the session once the user broadly recognises that their harsh self-judgment is an interpretation, that they are harsher on themselves than they would be on someone else, and that a mistake or setback need not become a global verdict on who they are. They do not need to state all three perfectly. If they have already accepted a reframe (for example, that they would treat a friend more kindly), do not repeat that technique. Close with a personalised one-sentence thought distilled from their own language, then stop.',
};
