import type { DailyConversationPatternGuide } from '../../types';

export const HARSH_SELF_CRITICISM_GUIDE: DailyConversationPatternGuide = {
  id: 'harsh-self-criticism',
  coreDynamic:
    'The user may be treating mistakes, weaknesses, or difficult emotions as evidence about their overall worth. Harsh internal language may feel motivating or truthful but can reduce perspective and increase shame.',
  explore: [
    'What exactly are they saying to themselves?',
    'Would they describe another person this way for the same behaviour?',
    'Are they judging a behaviour or their entire identity?',
    'What standard do they believe they failed?',
    'Do they believe harshness is necessary for improvement?',
  ],
  approaches: [
    'separate behaviour from identity',
    'replace absolute judgments with more accurate language',
    'compare their internal language with how they would speak to someone else',
    'look for evidence that does not fit the harsh conclusion',
    'focus on correction without humiliation',
  ],
  avoid: [
    'generic “be kinder to yourself”',
    'empty reassurance',
    'arguing that everything is fine',
    'forcing positive affirmations the user does not believe',
  ],
};
