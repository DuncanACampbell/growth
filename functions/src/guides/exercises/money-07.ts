import type { DailyExercise } from '../types';

import { MONEY_THEME_ID } from '../themes/money';

export const MONEY_DAY_07_ID = 'money-07';

export const MONEY_DAY_07: DailyExercise = {
  id: MONEY_DAY_07_ID,
  themeId: MONEY_THEME_ID,
  title: 'Your Relationship With Money',
  objective:
    'Bring the week together into a personal philosophy of money. This is a culmination, not another disconnected topic. The goal is a clearer and healthier personal relationship with money — not a financial plan, budget, savings target, or list of tasks.',
  openingPrompt: `You’ve spent a week looking at what money actually means to you — enough, old stories, worry, spending, worth, and uncertainty.

👉 What do you actually want money to provide in your life — and what do you no longer want it to control?

Don’t try to summarise everything. Name the distinction that feels most true now.`,
  whatToUnderstand:
    'Identify what money represents to them now, what they want it to provide, what they no longer want it to control, what responsible behaviour and enjoyment mean to them, what uncertainty they can accept, and which inherited beliefs they want to keep or leave. Work first from this conversation. If earlier-day Money programme memory is present, use it selectively so the week feels personalised — for example, if they already named a protected buffer so they can spend the remainder more freely, reflect that rather than asking from scratch what makes them feel secure. Do not dump all previous memory back at them. Do not invent discoveries they never made.',
  reframeGoal:
    'Help them articulate a principle they could actually live by: what money is for in their life, and how they want to relate to it when worry appears. Move from reacting to money as threat, scoreboard or forbidden pleasure toward using it in service of what they actually care about — security, freedom, or whatever they named. There is no predetermined correct philosophy.',
  desiredInsight:
    'The user should articulate some version of their own money philosophy in their wording. Do not claim they have permanently solved their relationship with money. End with a practical stance, not a transformation narrative.',
  anchorGuidance:
    'Day 7’s final statement should work as a concise personal money philosophy that could still feel useful later. Prefer their words and the week’s actual discoveries. Style examples (do not copy if their language is better): "Money is there to give me security and freedom, not to keep me permanently on guard." / "I can prepare for my future without making every decision out of fear." Do not reuse those automatically. After the statement, close warmly and concisely. Acknowledge that they have completed the seven-day Money programme. Do not introduce another exercise. Do not ask another question.',
  notes:
    'This is the last day of the seven-day programme. If earlier-day programme memory is present, you may draw on two or three highly relevant connections so the week feels joined up. Do not produce a report of all six days. Do not open by reciting previous sessions. If they do not mention earlier days and memory does not help, do not force it. Complete once they have named a personally meaningful stance toward money. Distil the finalStatement from that philosophy in their language. Then stop.',
};
