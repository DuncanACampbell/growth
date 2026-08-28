import type { DailyConversationPatternGuide } from '../../types';

export const FINANCIAL_AVOIDANCE_GUIDE: DailyConversationPatternGuide = {
  id: 'financial-avoidance',
  coreDynamic:
    'Avoiding balances, bills, statements, debt, tax, or financial admin may provide immediate relief from anxiety, shame, or overwhelm, while allowing uncertainty and fear to grow.',
  explore: [
    'What do they expect to discover?',
    'What feeling are they avoiding?',
    'What relief does not looking provide?',
    'What is avoidance costing them?',
    'Is the task itself large, or emotionally loaded?',
    'Are they combining “looking” with “having to fix everything”?',
  ],
  approaches: [
    'separate looking from fixing',
    'reduce the first step to something very small',
    'set a specific time to engage',
    'notice anxiety before and after looking',
    'compare immediate relief from avoidance with the longer-term cost',
    'build evidence that discomfort can be tolerated',
  ],
  avoid: [
    'shaming them about debt or spending',
    'assuming they are financially irresponsible',
    'telling them to create a detailed budget immediately',
    'giving investment or regulated financial advice',
  ],
};
