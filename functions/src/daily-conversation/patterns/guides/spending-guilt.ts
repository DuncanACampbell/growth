import type { DailyConversationPatternGuide } from '../../types';

export const SPENDING_GUILT_GUIDE: DailyConversationPatternGuide = {
  id: 'spending-guilt',
  coreDynamic:
    'The user may be treating spending itself as evidence of irresponsibility, even when the purchase may be affordable or planned. Money can become morally loaded.',
  explore: [
    'Was the spending actually unaffordable, or does it simply feel wrong?',
    'What rule do they believe they broke?',
    'Do they feel they must justify purchases?',
    'Where might that rule about money have come from?',
    'Is guilt helping them make better decisions or simply appearing after spending?',
  ],
  approaches: [
    'separate “I spent money” from “I made a bad financial decision”',
    'distinguish useful caution from automatic guilt',
    'identify what “affordable” means in their own situation',
    'question rigid inherited rules about deserving or spending',
    'notice whether guilt appears regardless of actual financial impact',
  ],
  avoid: [
    'encouraging spending',
    'telling the user the purchase was definitely fine',
    'assuming they have enough money',
    'giving budgeting instructions without context',
  ],
};
