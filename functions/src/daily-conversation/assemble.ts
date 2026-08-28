import { DAILY_CONVERSATION_CLASSIFICATION_INSTRUCTIONS } from './classification-instructions';
import { DAILY_CONVERSATION_GUIDE } from './conversation-guide';
import { buildDailyConversationPatternSummaryContext } from './patterns';
import { buildDailyConversationPatternGuideContext } from './patterns/guides';
import type { DailyConversationFocus } from './types';

/**
 * Assembles Daily Conversation prompt material only.
 * Detailed pattern guidance is injected from the incoming (previous-turn) focus,
 * not from the focus this turn will classify.
 */
export function assembleDailyConversationPrompt(input: {
  incomingFocus?: DailyConversationFocus | null;
  themeSummaries?: string;
  selectedPatternGuide?: string;
  priorMemory?: string;
  activeConversation?: string;
} = {}): string {
  const parts = [
    DAILY_CONVERSATION_GUIDE,
    buildDailyConversationPatternSummaryContext(),
    DAILY_CONVERSATION_CLASSIFICATION_INSTRUCTIONS,
  ];
  const incomingFocus = input.incomingFocus ?? null;
  if (incomingFocus) {
    const guideContext = buildDailyConversationPatternGuideContext(
      incomingFocus.pattern,
    );
    if (guideContext) {
      parts.push(guideContext);
    }
  }
  const themeSummaries = input.themeSummaries?.trim();
  const selectedPatternGuide = input.selectedPatternGuide?.trim();
  const priorMemory = input.priorMemory?.trim();
  const activeConversation = input.activeConversation?.trim();
  if (themeSummaries) {
    parts.push(themeSummaries);
  }
  if (selectedPatternGuide) {
    parts.push(selectedPatternGuide);
  }
  if (priorMemory) {
    parts.push(priorMemory);
  }
  if (activeConversation) {
    parts.push(activeConversation);
  }
  return parts.join('\n\n');
}
