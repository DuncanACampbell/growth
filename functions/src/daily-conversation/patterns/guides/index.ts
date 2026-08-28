import type {
  DailyConversationPatternGuide,
  DailyConversationPatternId,
} from '../../types';
import { COMPARISON_GUIDE } from './comparison';
import { FINANCIAL_AVOIDANCE_GUIDE } from './financial-avoidance';
import { FINANCIAL_INSECURITY_GUIDE } from './financial-insecurity';
import { HARSH_SELF_CRITICISM_GUIDE } from './harsh-self-criticism';
import { LOW_CONFIDENCE_AVOIDANCE_GUIDE } from './low-confidence-avoidance';
import { SPENDING_GUILT_GUIDE } from './spending-guilt';

const GUIDES: DailyConversationPatternGuide[] = [
  HARSH_SELF_CRITICISM_GUIDE,
  COMPARISON_GUIDE,
  LOW_CONFIDENCE_AVOIDANCE_GUIDE,
  FINANCIAL_AVOIDANCE_GUIDE,
  SPENDING_GUILT_GUIDE,
  FINANCIAL_INSECURITY_GUIDE,
];

const GUIDES_BY_ID = new Map(GUIDES.map((guide) => [guide.id, guide]));

const MONEY_PATTERN_IDS = new Set<DailyConversationPatternId>([
  'financial-avoidance',
  'spending-guilt',
  'financial-insecurity',
]);

export function getDailyConversationPatternGuide(
  patternId: DailyConversationPatternId,
): DailyConversationPatternGuide | null {
  return GUIDES_BY_ID.get(patternId) ?? null;
}

function formatList(label: string, items: string[]): string {
  return `${label}:\n${items.map((item) => `- ${item}`).join('\n')}`;
}

/**
 * Optional supporting guidance for the incoming (previous-turn) focus.
 * Informs reasoning; is not a script. Newly classified focus is for the next turn.
 */
export function buildDailyConversationPatternGuideContext(
  patternId: DailyConversationPatternId,
): string | null {
  const guide = getDailyConversationPatternGuide(patternId);
  if (!guide) {
    return null;
  }

  const moneySafety = MONEY_PATTERN_IDS.has(patternId)
    ? `

Daily Conversation may help the user reflect on their relationship with money and take simple organisational or personal-growth steps. It must not present itself as a professional financial adviser. Do not recommend specific investments or financial products, make tax or legal claims, or guarantee financial outcomes.`
    : '';

  return `OPTIONAL SUPPORTING GUIDANCE FOR THIS TURN
This guide is optional supporting material for the incoming conversation focus. It should inform reasoning, not become a script. Do not mechanically use every approach. Do not expose internal pattern names. Choose only what is relevant to what the user has actually said. Understanding is still more important than rushing into advice.${moneySafety}

Core dynamic:
${guide.coreDynamic}

${formatList('Explore', guide.explore)}

${formatList('Approaches', guide.approaches)}

${formatList('Avoid', guide.avoid)}`;
}
