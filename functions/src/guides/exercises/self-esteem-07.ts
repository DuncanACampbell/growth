import type { DailyExercise } from '../types';

import { SELF_ESTEEM_THEME_ID } from '../themes/self-esteem';

export const SELF_ESTEEM_DAY_07_ID = 'self-esteem-07';

export const SELF_ESTEEM_DAY_07: DailyExercise = {
  id: SELF_ESTEEM_DAY_07_ID,
  themeId: SELF_ESTEEM_THEME_ID,
  title: 'Your Own Measure',
  objective:
    "Bring the week's work together. Help the user identify how their approach to judging themselves has shifted and articulate a more internally grounded standard for self-respect going forward. This is a completion exercise, not another investigation into a new insecurity. The conversation should feel reflective, integrative and slightly more conclusive than earlier days.",
  openingPrompt: `Over the last week, you've spent quite a lot of time looking at the way you judge yourself.

👉 **What do you think you've been getting wrong about the way you evaluate yourself?**

Don't worry about summarising everything. Just tell me the biggest thing that stands out.`,
  whatToUnderstand:
    'Identify what they believe they have learned, which external measures have had too much power, which internal qualities or standards now feel more important, and what they would like to do differently when self-judgment appears again. Work only from what they say in this conversation. Earlier-day memory is not provided. Do not invent or fabricate previous discoveries. If they mention earlier days, use only what they themselves recall.',
  reframeGoal:
    'Move from "What proves I\'m good enough?" toward "What standards do I actually want to use when deciding whether I respect myself?" A useful later-stage question may be equivalent to: if they got to decide what makes someone worthy of their own respect — rather than letting success, mistakes, comparison or other people\'s opinions decide — what would they choose? Do not use this mechanically if the conversation reaches the point another way. There is no predetermined correct answer. The standard may include values, character, how they treat people, how they respond to mistakes, willingness to learn, persistence, courage, curiosity, integrity, fairness toward themselves, or another personally meaningful measure.',
  desiredInsight:
    'The user should articulate some version of their own internally grounded basis for self-respect. Prefer their own wording. Do not claim they have permanently solved their self-esteem. End with a practical shift in perspective, not a transformation narrative.',
  anchorGuidance:
    'Day 7\'s final statement is more important than earlier daily anchors. Generate one concise personalised statement that captures their emerging philosophy of self-respect. Prefer a statement that could still feel useful weeks later. Use their own words and discoveries. Style examples (do not copy if their language is better): "I want success and approval, but I don\'t need them to decide whether I respect myself." / "I judge myself by how I live and learn, not only by whether everything works out." / "I can make mistakes, want more from life, and still respect the person I\'m becoming." Do not use a generic graduation message such as "I am enough." After the statement, close warmly and concisely. Acknowledge that they have completed the seven-day Self Esteem programme. Do not introduce another exercise. Do not ask another question.',
  notes:
    'This is the last day of the seven-day programme. Reflect patterns they identify. Do not summarise them as a generated report. Treat their standard seriously and help them notice how it differs from the measures they relied upon earlier. This exercise is structured to accept earlier-day programme memory when that layer exists; it is not provided in this session. If they do not mention earlier days, do not invent them. Complete once they have named a personally meaningful internal standard. Distil the finalStatement from that standard in their language. Then stop.',
};
