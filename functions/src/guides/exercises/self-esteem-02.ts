import type { DailyExercise } from '../types';

import { SELF_ESTEEM_THEME_ID } from '../themes/self-esteem';

export const SELF_ESTEEM_DAY_02_ID = 'self-esteem-02';

export const SELF_ESTEEM_DAY_02: DailyExercise = {
  id: SELF_ESTEEM_DAY_02_ID,
  themeId: SELF_ESTEEM_THEME_ID,
  title: 'Your Inner Voice',
  objective:
    'Help the user notice how they speak to themselves after a mistake, a failure, or a disappointment. The aim is not to remove criticism or to convince them that mistakes do not matter. Help them distinguish useful evaluation from self-attack, so they can acknowledge what went wrong without turning against themselves.',
  openingPrompt: `Think of a recent time you made a mistake, got something wrong, or felt like you'd messed something up.

👉 **What did you say to yourself about it?**

Not what happened — what was the message you gave yourself afterwards?`,
  whatToUnderstand:
    "Identify what happened, the language or message they directed at themselves, whether the criticism stayed on the specific behaviour or expanded into a judgment about who they are, and what they hoped the self-criticism would achieve. Do not ask these as a checklist. If the first answer already shows the pattern, move forward.",
  reframeGoal:
    'Explore what a fair but constructive response to the same mistake might sound like. Do not replace criticism with artificial positivity. The alternative should still allow responsibility. A useful direction is: if they wanted to learn from this rather than punish themselves for it, what would they actually need to tell themselves? Adapt the wording to their situation. Useful distinctions: "I handled that badly" versus "I\'m useless"; "I should prepare differently next time" versus "I always screw things up"; accountability versus punishment; learning versus humiliation; disappointment versus identity.',
  desiredInsight:
    'Guide toward something broadly equivalent to: I can acknowledge that I made a mistake without using the mistake as an excuse to attack myself. Prefer the user\'s own version.',
  anchorGuidance:
    'Create one short statement based primarily on the user\'s own reframe. Style examples (do not copy if their language is better): "I can correct myself without tearing myself down." / "I handled that badly. That tells me what to change, not who I am." / "A mistake needs a lesson, not a character assassination." After the anchor, end the conversation. Keep the ending brief. Make it clear that today\'s exercise is complete and the programme will continue tomorrow. Do not ask another question.',
  notes:
    'Acknowledge the frustration, embarrassment, disappointment or other emotion attached to the mistake. Do not immediately tell them to "be kinder to yourself." Look at what the inner voice is actually doing and whether that response is useful. When they produce a fairer internal response, point out that it can still contain accountability. Self-respect does not require pretending they were right or that nothing went wrong. Complete once they can acknowledge the mistake without converting it into an attack on themselves. Distil the finalStatement from their own language.',
};
