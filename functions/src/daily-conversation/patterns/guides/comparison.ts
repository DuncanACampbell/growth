import type { DailyConversationPatternGuide } from '../../types';

export const COMPARISON_GUIDE: DailyConversationPatternGuide = {
  id: 'comparison',
  coreDynamic:
    'The user may be using another person’s visible strengths, success, appearance, relationships, or progress as evidence that they themselves are inadequate.',
  explore: [
    'What exactly are they comparing?',
    'What does the other person’s advantage seem to mean about them?',
    'Are they comparing another person’s visible outcome with their own full internal experience?',
    'What information about the other person is missing?',
    'Is the comparison pointing toward something they genuinely value?',
  ],
  approaches: [
    'distinguish observation from self-judgment',
    'notice incomplete or selective comparison',
    'identify what the comparison reveals about the user’s own values',
    'compare with their own past trajectory where useful',
    'turn envy or discomfort into information rather than proof of inferiority',
  ],
  avoid: [
    'simply telling them to stop comparing',
    'dismissing the other person’s real advantages',
    'claiming social media is always the cause',
    'forced gratitude exercises unless contextually useful',
  ],
};
