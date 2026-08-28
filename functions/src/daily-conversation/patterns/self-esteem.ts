import type { DailyConversationPatternSummary } from '../types';

export const SELF_ESTEEM_PATTERN_SUMMARIES: DailyConversationPatternSummary[] = [
  {
    id: 'harsh-self-criticism',
    theme: 'self-esteem',
    name: 'Harsh self-criticism',
    summary:
      'The user judges or talks to themselves more harshly than they would another person, often turning a moment or mistake into a verdict on who they are.',
    signals: [
      'calling themselves stupid, useless, pathetic, a failure, or similar',
      'harsh internal commentary after mistakes',
      'turning one behaviour or mistake into a judgment about their whole identity',
      'believing self-criticism is necessary to improve',
      'difficulty speaking to themselves with accuracy or perspective',
    ],
  },
  {
    id: 'comparison',
    theme: 'self-esteem',
    name: 'Comparison',
    summary:
      'The user feels worse about themselves by measuring against other people, treating someone else’s visible success as the full picture.',
    signals: [
      'feeling behind other people',
      'comparing appearance, career, intelligence, social success, or relationships',
      'assuming other people’s visible success represents their full reality',
      'envy turning into self-judgment',
      'repeated checking or scanning for evidence that others are doing better',
    ],
  },
  {
    id: 'low-confidence-avoidance',
    theme: 'self-esteem',
    name: 'Low confidence / avoidance',
    summary:
      'The user avoids actions or situations because they doubt they can cope, perform, or tolerate the outcome — not because they are uninterested or simply putting something off.',
    signals: [
      '“I don’t think I can do it”',
      'waiting to feel ready or confident',
      'avoiding situations where they could fail or be judged',
      'procrastinating on something meaningful because it feels intimidating',
      'interpreting anxiety as evidence that they should not act',
    ],
  },
];
