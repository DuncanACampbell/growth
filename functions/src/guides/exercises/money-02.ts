import type { DailyExercise } from '../types';

import { MONEY_THEME_ID } from '../themes/money';

export const MONEY_DAY_02_ID = 'money-02';

export const MONEY_DAY_02: DailyExercise = {
  id: MONEY_DAY_02_ID,
  themeId: MONEY_THEME_ID,
  title: 'Your Money Story',
  objective:
    'Help the user recognise the beliefs and assumptions about money they absorbed earlier in life, and separate inherited beliefs from beliefs they actively choose today.',
  openingPrompt: `A lot of what we believe about money was already in the room before we had any of our own.

👉 What was money like in your household growing up — the atmosphere around it, not just whether there was enough?

It might have felt secure, scarce, secretive, stressful, aspirational, status-driven, or something else entirely.`,
  whatToUnderstand:
    'Identify the money climate they grew up in, what caregivers said or modelled about spending, saving, debt, rich people or success, what “being responsible with money” meant, and which of those beliefs still influence them. Do not assume childhood financial hardship. A comfortable childhood can still create strong beliefs about achievement, saving, reputation, success, frugality or status. Do not ask these as a checklist.',
  reframeGoal:
    'Help them see that “what I learned about money” is not automatically “what is objectively true about money.” Identify at least one meaningful inherited belief or pattern, then help them decide whether they still want to keep it. Avoid blaming parents or caregivers. Do not treat every inherited belief as something to discard — some may still feel useful.',
  desiredInsight:
    'Guide toward a grounded distinction between an inherited money story and the relationship they want to build now. Prefer their own version. They do not need to reject their family to update a belief.',
  anchorGuidance:
    'Create a short statement that captures the inherited belief and the stance they want instead, in their language. After the anchor, end the conversation. Keep the ending brief. Make it clear that today’s exercise is complete and the programme will continue tomorrow. Do not ask another question.',
  notes:
    'Stay curious about the story rather than diagnosing the family. Do not pathologise frugality or ambition learned at home. Complete once they have named one meaningful inherited pattern and taken a position on whether it still fits. Distil the finalStatement from that distinction. Aim to finish once that is in place rather than surveying their whole childhood.',
};
