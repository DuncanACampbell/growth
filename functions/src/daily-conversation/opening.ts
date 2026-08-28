import type { DailyConversationMemory } from './memory';

export const FIRST_DAILY_CONVERSATION_OPENING =
  "What's been on your mind lately? It can be something big, small, or just something you keep coming back to.";

const GENERIC_RETURNING_OPENING =
  'Want to pick up from last time, or is something else on your mind today?';

const MAX_TOPIC_CHARS = 120;
const INSTRUCTION_FOLLOW_UP =
  /^(ask|check|follow up|remind|probe|explore|see if|find out)\b/i;

function trimField(value: unknown, maxChars: number): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.replace(/\s+/g, ' ').trim().slice(0, maxChars);
}

function looksLikeInternalInstruction(followUp: string): boolean {
  return INSTRUCTION_FOLLOW_UP.test(followUp);
}

/**
 * Reads only the fields needed for a returning-day opening.
 * Daily Conversation memory is intentionally separate from guided programme memory
 * because this is an experimental independent mechanic.
 */
export function readOpeningMemory(value: unknown): {
  topic: string;
  followUp: string | null;
} | null {
  if (value == null) {
    return null;
  }
  if (typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const topic = trimField(record.topic, MAX_TOPIC_CHARS);
  const followUp = trimField(record.followUp, MAX_TOPIC_CHARS);
  return {
    topic,
    followUp: followUp.length > 0 ? followUp : null,
  };
}

function openingFromTopic(topic: string): string {
  return `We talked about ${topic} last time. Want to keep going with that, or is something else on your mind today?`;
}

/**
 * Deterministic Daily Conversation opening. No LLM.
 * Priority: useful user-facing followUp, then topic, then a generic returning line.
 */
export function createDailyConversationOpening(
  previousMemory?: DailyConversationMemory | null | unknown,
): string {
  const memory = readOpeningMemory(previousMemory ?? null);
  if (!memory) {
    return FIRST_DAILY_CONVERSATION_OPENING;
  }

  const followUp = memory.followUp;
  if (
    followUp &&
    memory.topic &&
    !looksLikeInternalInstruction(followUp)
  ) {
    const followUpClause = /[?.!]$/.test(followUp) ? followUp : `${followUp}.`;
    return `Yesterday we talked about ${memory.topic}. ${followUpClause} Or is something else on your mind today?`;
  }

  if (memory.topic) {
    return openingFromTopic(memory.topic);
  }

  return GENERIC_RETURNING_OPENING;
}
