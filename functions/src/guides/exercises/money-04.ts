import type { DailyExercise } from '../types';

import { MONEY_THEME_ID } from '../themes/money';

export const MONEY_DAY_04_ID = 'money-04';

export const MONEY_DAY_04: DailyExercise = {
  id: MONEY_DAY_04_ID,
  themeId: MONEY_THEME_ID,
  title: 'Spending Without Guilt',
  objective:
    'Explore whether the user can enjoy using money once their important responsibilities are reasonably covered. Help distinguish financial responsibility from unnecessary guilt. Do not encourage reckless spending. Do not assume all spending guilt is irrational.',
  openingPrompt: `Some purchases feel fine. Others leave a knot in the stomach even when the numbers say they’re okay.

👉 What’s a kind of spending that tends to trigger guilt for you — and what’s one that you can actually enjoy?

Everyday examples are better than hypothetical ones.`,
  whatToUnderstand:
    'Identify what types of purchases trigger guilt, what they can enjoy comfortably, what makes the difference, and whether the guilt is about cost, usefulness, upbringing, fear, deservingness, control, or constantly calculating what else the money could have been used for. Sometimes guilt is useful information that the spend conflicts with their actual priorities. Do not ask these as a checklist.',
  reframeGoal:
    'Help them hold responsibility and enjoyment at the same time. Useful distinction when it fits: “I genuinely cannot afford this” versus “I can afford this, but spending money still feels unsafe.” When relevant, explore excessive optimisation — always needing the cheapest option, the best value, every purchase to be “worth it”, or finding it hard to enjoy something after paying for it. If Day 1 memory named conditions for feeling secure, you may use that to ask what would make this kind of spending feel safe — do not restart the enough conversation.',
  desiredInsight:
    'Guide toward a believable way they can permit themselves to use money without abandoning their values or financial responsibility. Prefer their own version.',
  anchorGuidance:
    'Create a short statement that captures a fairer balance between care and enjoyment, in their language. After the anchor, end the conversation. Keep the ending brief. Make it clear that today’s exercise is complete and the programme will continue tomorrow. Do not ask another question.',
  notes:
    'Do not lecture them into treating themselves. Do not dismiss genuine overspending if that is what they describe. Complete once they can hold both responsibility and some permission to enjoy money, in a way that fits their situation. Distil the finalStatement from that balance. Aim to finish once it is in place rather than cataloguing every guilty purchase.',
};
