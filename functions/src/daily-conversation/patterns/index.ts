import type {
  DailyConversationPatternId,
  DailyConversationPatternSummary,
  DailyConversationTheme,
} from '../types';
import { MONEY_PATTERN_SUMMARIES } from './money';
import { SELF_ESTEEM_PATTERN_SUMMARIES } from './self-esteem';

export const DAILY_CONVERSATION_PATTERN_SUMMARIES: DailyConversationPatternSummary[] =
  [...SELF_ESTEEM_PATTERN_SUMMARIES, ...MONEY_PATTERN_SUMMARIES];

const SUMMARIES_BY_ID = new Map(
  DAILY_CONVERSATION_PATTERN_SUMMARIES.map((item) => [item.id, item]),
);

export function getDailyConversationPatternSummary(
  id: DailyConversationPatternId,
): DailyConversationPatternSummary | null {
  return SUMMARIES_BY_ID.get(id) ?? null;
}

export function getDailyConversationPatternSummariesForTheme(
  theme: DailyConversationTheme,
): DailyConversationPatternSummary[] {
  return DAILY_CONVERSATION_PATTERN_SUMMARIES.filter((item) => item.theme === theme);
}

export function getDailyConversationThemeForPattern(
  pattern: DailyConversationPatternId,
): DailyConversationTheme | null {
  return getDailyConversationPatternSummary(pattern)?.theme ?? null;
}

export function isValidDailyConversationPatternForTheme(
  theme: DailyConversationTheme,
  pattern: DailyConversationPatternId,
): boolean {
  return getDailyConversationThemeForPattern(pattern) === theme;
}

function formatThemeBlock(
  heading: string,
  summaries: DailyConversationPatternSummary[],
): string {
  const blocks = summaries.map((item) => {
    const signals = item.signals.map((signal) => `- ${signal}`).join('\n');
    return `${item.id}\n${item.name}\n${item.summary}\nSignals:\n${signals}`;
  });
  return `${heading}\n${blocks.join('\n\n')}`;
}

/**
 * Prompt-only catalogue text. These are the only specialised patterns in V1.
 * A user's situation does not need to match any of them. Prefer focus: null
 * over a weak match. Topics unrelated to Money or Self-Esteem stay unclassified.
 */
export function buildDailyConversationPatternSummaryContext(): string {
  return `AVAILABLE SPECIALISED PATTERNS
These are the only currently supported specialised patterns. The user's situation does NOT need to match any of them. Prefer focus: null over forcing a weak match. Topics unrelated to Money or Self-Esteem (for example “My boyfriend annoyed me yesterday”) must remain unclassified.

${formatThemeBlock('SELF-ESTEEM', SELF_ESTEEM_PATTERN_SUMMARIES)}

${formatThemeBlock('MONEY', MONEY_PATTERN_SUMMARIES)}`;
}
