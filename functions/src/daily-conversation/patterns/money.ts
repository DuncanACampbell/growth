import type { DailyConversationPatternSummary } from '../types';

export const MONEY_PATTERN_SUMMARIES: DailyConversationPatternSummary[] = [
  {
    id: 'financial-avoidance',
    theme: 'money',
    name: 'Financial avoidance',
    summary:
      'The user avoids looking at or dealing with finances because it feels uncomfortable, frightening, shameful, or overwhelming.',
    signals: [
      'not opening bills or statements',
      'avoiding bank balances',
      'delaying financial admin',
      'ignoring debt, tax, or payment issues',
      'immediate relief from not looking',
      'anxiety increasing as avoidance continues',
    ],
  },
  {
    id: 'spending-guilt',
    theme: 'money',
    name: 'Spending guilt',
    summary:
      'The user feels irresponsible, guilty, or morally uncomfortable after spending, including when the spending may be affordable.',
    signals: [
      'guilt after discretionary purchases',
      'believing spending on oneself is irresponsible',
      'feeling the need to justify purchases',
      'difficulty enjoying money that has already been budgeted or earned',
      'confusing the fact of spending with making a bad financial decision',
    ],
  },
  {
    id: 'financial-insecurity',
    theme: 'money',
    name: 'Financial insecurity',
    summary:
      'The user has a persistent fear about future financial safety or not having enough. This describes their experience of insecurity, not necessarily actual poverty or crisis.',
    signals: [
      'fear of running out of money',
      'anxiety about losing income',
      'feeling unsafe despite some objective stability',
      'difficulty identifying what amount would feel like “enough”',
      'persistent worry about future financial scenarios',
    ],
  },
];
