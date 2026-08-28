import type { DailyConversationFocus, DailyConversationTheme } from './types';

/**
 * Daily Conversation memory is intentionally separate from guided programme
 * memory because this is an experimental independent mechanic.
 */
export type DailyConversationOutcomeType = 'insight' | 'experiment' | 'action';

export type DailyConversationMemory = {
  topic: string;
  theme: DailyConversationTheme | null;
  pattern: string | null;
  situation: string;
  insight: string;
  outcomeType: DailyConversationOutcomeType | null;
  outcome: string | null;
  followUp: string | null;
  finalThought: string;
  completedAt: string;
};

export type DailyConversationMemoryDraft = {
  topic: string;
  situation: string;
  insight: string;
  outcomeType: DailyConversationOutcomeType | null;
  outcome: string | null;
  followUp: string | null;
};

const OUTCOME_TYPES = new Set<DailyConversationOutcomeType>([
  'insight',
  'experiment',
  'action',
]);

const LIMITS = {
  topic: 120,
  situation: 280,
  insight: 220,
  outcome: 220,
  followUp: 120,
  finalThought: 220,
};

function trimField(value: unknown, maxChars: number): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/\s+/g, ' ').trim().slice(0, maxChars);
}

function optionalField(value: unknown, maxChars: number): string | null {
  const trimmed = trimField(value, maxChars);
  return trimmed.length > 0 ? trimmed : null;
}

function parseOutcomeType(value: unknown): DailyConversationOutcomeType | null {
  return typeof value === 'string' && OUTCOME_TYPES.has(value as DailyConversationOutcomeType)
    ? (value as DailyConversationOutcomeType)
    : null;
}

export function parseDailyConversationMemoryDraft(
  value: unknown,
): DailyConversationMemoryDraft | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const topic = trimField(record.topic, LIMITS.topic);
  const situation = trimField(record.situation, LIMITS.situation);
  const insight = trimField(record.insight, LIMITS.insight);
  if (!topic || !situation || !insight) {
    return null;
  }
  return {
    topic,
    situation,
    insight,
    outcomeType: parseOutcomeType(record.outcomeType),
    outcome: optionalField(record.outcome, LIMITS.outcome),
    followUp: optionalField(record.followUp, LIMITS.followUp),
  };
}

export function parseStoredDailyConversationMemory(
  value: unknown,
): DailyConversationMemory | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const topic = trimField(record.topic, LIMITS.topic);
  const situation = trimField(record.situation, LIMITS.situation);
  const insight = trimField(record.insight, LIMITS.insight);
  const finalThought = trimField(record.finalThought, LIMITS.finalThought);
  if (!topic || !situation || !insight || !finalThought) {
    return null;
  }
  const theme =
    record.theme === 'self-esteem' || record.theme === 'money'
      ? record.theme
      : null;
  const pattern = optionalField(record.pattern, 80);
  return {
    topic,
    theme,
    pattern,
    situation,
    insight,
    outcomeType: parseOutcomeType(record.outcomeType),
    outcome: optionalField(record.outcome, LIMITS.outcome),
    followUp: optionalField(record.followUp, LIMITS.followUp),
    finalThought,
    completedAt:
      typeof record.completedAt === 'string' && record.completedAt.trim()
        ? record.completedAt.trim()
        : new Date().toISOString(),
  };
}

export function buildDailyConversationMemory(input: {
  draft: DailyConversationMemoryDraft | null;
  focus: DailyConversationFocus | null;
  finalThought: string;
  completedAt: string;
}): DailyConversationMemory {
  const draft = input.draft ?? {
    topic: "Today's conversation",
    situation: 'The user talked through something that was on their mind.',
    insight: input.finalThought,
    outcomeType: 'insight' as const,
    outcome: null,
    followUp: null,
  };
  return {
    topic: draft.topic,
    theme: input.focus?.theme ?? null,
    pattern: input.focus?.pattern ?? null,
    situation: draft.situation,
    insight: draft.insight,
    outcomeType: draft.outcomeType,
    outcome: draft.outcome,
    followUp: draft.followUp,
    finalThought: input.finalThought,
    completedAt: input.completedAt,
  };
}

/** Compact previous-conversation context for the LLM. Does not include theme/pattern IDs. */
export function formatDailyConversationPreviousMemoryContext(
  memory: DailyConversationMemory | null,
): string | null {
  if (!memory) {
    return null;
  }
  const lines = [
    'PREVIOUS CONVERSATION MEMORY',
    'This is compact context from a completed conversation before today. It is not today\'s classification or focus.',
    'Use it only when relevant to today\'s conversation.',
    'If the user wants to continue, use it to understand what they are continuing.',
    'If the user changes subject, let this recede and classify today independently from what they are discussing now.',
    'Do not mention internal theme or pattern names.',
    '',
    `Topic: ${memory.topic}`,
    `Situation: ${memory.situation}`,
    `Insight: ${memory.insight}`,
  ];
  if (memory.outcomeType) {
    lines.push(`Outcome type: ${memory.outcomeType}`);
  }
  if (memory.outcome) {
    lines.push(`Outcome: ${memory.outcome}`);
  }
  if (memory.followUp) {
    lines.push(`Follow-up: ${memory.followUp}`);
  }
  return lines.join('\n');
}
