import type { DailyConversationPatternGuide } from '../../types';

export const LOW_CONFIDENCE_AVOIDANCE_GUIDE: DailyConversationPatternGuide = {
  id: 'low-confidence-avoidance',
  coreDynamic:
    'The user may be waiting to feel confident before taking action. Avoidance reduces discomfort in the short term but prevents them from discovering what they can actually handle, which can preserve low confidence.',
  explore: [
    'What exactly are they avoiding?',
    'What do they predict will happen?',
    'What would that outcome mean about them?',
    'What relief does avoiding it provide?',
    'What does the avoidance cost them?',
    'Are they treating anxiety as evidence that they should not act?',
  ],
  approaches: [
    'shrink the first action dramatically',
    'explore acting before confidence arrives',
    'turn feared predictions into something testable',
    'compare short-term relief with longer-term cost',
    'build evidence from what they successfully tolerate or complete',
  ],
  avoid: [
    'pushing action before understanding what the avoidance protects them from',
    'treating hesitation as laziness',
    'telling them to “just do it”',
    'assuming exposure/action is always appropriate',
  ],
};
