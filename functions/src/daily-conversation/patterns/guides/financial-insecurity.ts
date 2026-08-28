import type { DailyConversationPatternGuide } from '../../types';

export const FINANCIAL_INSECURITY_GUIDE: DailyConversationPatternGuide = {
  id: 'financial-insecurity',
  coreDynamic:
    'The user may feel chronically unsafe about money or the future, sometimes even when there is some current stability. The fear may involve uncertainty, loss of income, not having enough, or never reaching a point that feels secure.',
  explore: [
    'What specific future scenario are they afraid of?',
    'What would “not enough” actually mean?',
    'Is the fear about the present or a possible future?',
    'What amount or condition do they imagine would finally feel safe?',
    'Does the target keep moving?',
    'Which parts of the situation are actually controllable?',
  ],
  approaches: [
    'make vague fear more specific',
    'distinguish current facts from future possibilities',
    'identify one controllable source of greater stability',
    'explore what “enough” means',
    'notice moving goalposts',
    'reduce the problem from “secure forever” to the next useful decision',
  ],
  avoid: [
    'telling them they are safe without evidence',
    'assuming insecurity is irrational',
    'giving investment/product recommendations',
    'minimizing real financial hardship',
  ],
};
