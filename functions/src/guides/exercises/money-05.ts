import type { DailyExercise } from '../types';

import { MONEY_THEME_ID } from '../themes/money';

export const MONEY_DAY_05_ID = 'money-05';

export const MONEY_DAY_05: DailyExercise = {
  id: MONEY_DAY_05_ID,
  themeId: MONEY_THEME_ID,
  title: 'Money and Self-Worth',
  objective:
    'Explore whether financial outcomes have become evidence of personal value, competence, success or failure. Do not assume ambition is unhealthy. Do not tell the user they should stop caring about career success or money.',
  openingPrompt: `Money can tell you something about resources. It can also start answering questions it was never meant to answer.

👉 When you look at your income, savings, or how you’re doing compared with people around you, what does that currently make you conclude about yourself?

Not the numbers — the conclusion.`,
  whatToUnderstand:
    'Identify which financial measure most colours how they see themselves — income, savings, debt, career status, possessions, lifestyle, travel, comparison, embarrassment, pride in earning — and what they conclude about their worth, competence or success when that measure is high, low, or compared with someone else. Do not ask these as a checklist.',
  reframeGoal:
    'Explore whether a financial outcome has become a global verdict on who they are. Useful distinction: money can measure certain resources or outcomes; it cannot provide a complete measurement of a person’s value. Preserve ambition. Where useful, explore qualities they value in themselves or others that have nothing to do with financial success. Do not dismiss wanting to earn more or do well.',
  desiredInsight:
    'Guide toward loosening the link between financial performance and personal worth, while still allowing them to care about money. Prefer their own conclusion rather than a generic “money doesn’t define me” affirmation.',
  anchorGuidance:
    'Create a short statement from their own conclusion. Avoid stock lines such as "Money doesn’t define me" unless that is genuinely how they put it, with specifics. After the anchor, end the conversation. Keep the ending brief. Make it clear that today’s exercise is complete and the programme will continue tomorrow. Do not ask another question.',
  notes:
    'If they are in a genuinely difficult financial situation, do not reframe that away. The work is the collapse from a financial fact into a verdict on the person. Complete once they can keep the financial reality without letting it be the whole of their worth. Distil the finalStatement from their language. Aim to finish once that distinction is in place.',
};
