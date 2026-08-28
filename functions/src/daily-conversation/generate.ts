import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';
import OpenAI from 'openai';

import { assembleDailyConversationPrompt } from './assemble';
import { dailyConversationCompletionHint } from './completion';
import {
  parseDailyConversationMemoryDraft,
  type DailyConversationMemory,
  type DailyConversationMemoryDraft,
} from './memory';
import { isValidDailyConversationPatternForTheme } from './patterns';
import type {
  DailyConversationCandidate,
  DailyConversationClassification,
  DailyConversationConfidence,
  DailyConversationFocus,
  DailyConversationMessage,
  DailyConversationPatternId,
  DailyConversationTheme,
} from './types';
import {
  DAILY_CONVERSATION_CONFIDENCES,
  DAILY_CONVERSATION_PATTERN_IDS,
  DAILY_CONVERSATION_THEMES,
} from './types';

/** Same secret as other Functions; Daily Conversation does not use the guided-exercise LLM module. */
export const dailyConversationOpenaiApiKey = defineSecret('OPENAI_API_KEY');

const MODEL = 'gpt-4.1-mini';
const MAX_CANDIDATES = 3;

const THEMES = new Set<string>(DAILY_CONVERSATION_THEMES);
const PATTERN_IDS = new Set<string>(DAILY_CONVERSATION_PATTERN_IDS);
const CONFIDENCES = new Set<string>(DAILY_CONVERSATION_CONFIDENCES);

const TURN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['message', 'candidates', 'focus', 'shouldComplete', 'finalThought', 'memory'],
  properties: {
    message: { type: 'string' },
    shouldComplete: { type: 'boolean' },
    finalThought: { type: ['string', 'null'] },
    memory: {
      type: ['object', 'null'],
      additionalProperties: false,
      required: [
        'topic',
        'situation',
        'insight',
        'outcomeType',
        'outcome',
        'followUp',
      ],
      properties: {
        topic: { type: 'string' },
        situation: { type: 'string' },
        insight: { type: 'string' },
        outcomeType: {
          type: ['string', 'null'],
          enum: ['insight', 'experiment', 'action', null],
        },
        outcome: { type: ['string', 'null'] },
        followUp: { type: ['string', 'null'] },
      },
    },
    candidates: {
      type: 'array',
      maxItems: MAX_CANDIDATES,
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['theme', 'pattern', 'confidence'],
        properties: {
          theme: { type: 'string', enum: [...DAILY_CONVERSATION_THEMES] },
          pattern: { type: 'string', enum: [...DAILY_CONVERSATION_PATTERN_IDS] },
          confidence: {
            type: 'string',
            enum: [...DAILY_CONVERSATION_CONFIDENCES],
          },
        },
      },
    },
    focus: {
      type: ['object', 'null'],
      additionalProperties: false,
      required: ['theme', 'pattern'],
      properties: {
        theme: { type: 'string', enum: [...DAILY_CONVERSATION_THEMES] },
        pattern: { type: 'string', enum: [...DAILY_CONVERSATION_PATTERN_IDS] },
      },
    },
  },
} as const;

export type DailyConversationModelTurn = {
  message: string;
  classification: DailyConversationClassification;
  shouldComplete: boolean;
  finalThought: string | null;
  memoryDraft: DailyConversationMemoryDraft | null;
};

function isTheme(value: unknown): value is DailyConversationTheme {
  return typeof value === 'string' && THEMES.has(value);
}

function isPatternId(value: unknown): value is DailyConversationPatternId {
  return typeof value === 'string' && PATTERN_IDS.has(value);
}

function isConfidence(value: unknown): value is DailyConversationConfidence {
  return typeof value === 'string' && CONFIDENCES.has(value);
}

function parseCandidate(value: unknown): DailyConversationCandidate | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  const record = value as {
    theme?: unknown;
    pattern?: unknown;
    confidence?: unknown;
  };
  if (
    !isTheme(record.theme) ||
    !isPatternId(record.pattern) ||
    !isConfidence(record.confidence)
  ) {
    return null;
  }
  if (!isValidDailyConversationPatternForTheme(record.theme, record.pattern)) {
    return null;
  }
  return {
    theme: record.theme,
    pattern: record.pattern,
    confidence: record.confidence,
  };
}

function parseFocus(value: unknown): DailyConversationFocus | null | undefined {
  if (value === null) {
    return null;
  }
  if (!value || typeof value !== 'object') {
    return undefined;
  }
  const record = value as { theme?: unknown; pattern?: unknown };
  if (!isTheme(record.theme) || !isPatternId(record.pattern)) {
    return undefined;
  }
  if (!isValidDailyConversationPatternForTheme(record.theme, record.pattern)) {
    return undefined;
  }
  return { theme: record.theme, pattern: record.pattern };
}

function uniqueCandidates(
  candidates: DailyConversationCandidate[],
): DailyConversationCandidate[] {
  const seen = new Set<string>();
  const unique: DailyConversationCandidate[] = [];
  for (const item of candidates) {
    const key = `${item.theme}:${item.pattern}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    unique.push(item);
    if (unique.length >= MAX_CANDIDATES) {
      break;
    }
  }
  return unique;
}

export function sanitizeDailyConversationModelOutput(raw: unknown): DailyConversationModelTurn | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }
  const record = raw as {
    message?: unknown;
    candidates?: unknown;
    focus?: unknown;
    shouldComplete?: unknown;
    finalThought?: unknown;
    memory?: unknown;
  };
  if (typeof record.message !== 'string' || record.message.trim().length === 0) {
    return null;
  }
  const message = record.message.trim();
  if (message.startsWith('{') && /"candidates"\s*:/.test(message)) {
    return null;
  }

  let candidates: DailyConversationCandidate[] = [];
  if (Array.isArray(record.candidates)) {
    candidates = uniqueCandidates(
      record.candidates
        .map(parseCandidate)
        .filter((item): item is DailyConversationCandidate => item !== null),
    );
  }

  const parsedFocus = parseFocus(record.focus ?? null);
  let focus: DailyConversationFocus | null = null;
  if (parsedFocus === undefined) {
    focus = null;
  } else if (parsedFocus === null) {
    focus = null;
  } else if (
    candidates.some(
      (item) =>
        item.theme === parsedFocus.theme && item.pattern === parsedFocus.pattern,
    )
  ) {
    focus = parsedFocus;
  } else if (candidates.length === 0) {
    focus = null;
  } else {
    focus = null;
  }

  const shouldComplete = record.shouldComplete === true;
  let finalThought: string | null = null;
  if (typeof record.finalThought === 'string' && record.finalThought.trim()) {
    finalThought = record.finalThought.trim();
  }
  const memoryDraft = shouldComplete
    ? parseDailyConversationMemoryDraft(record.memory)
    : null;

  return {
    message,
    classification: { candidates, focus },
    shouldComplete,
    finalThought,
    memoryDraft,
  };
}

export async function generateDailyConversationTurn(input: {
  messages: DailyConversationMessage[];
  turnCount: number;
  suggestedPhase: string;
  incomingFocus: DailyConversationFocus | null;
  previousMemory: DailyConversationMemory | null;
  wrapUp?: boolean;
}): Promise<DailyConversationModelTurn> {
  const apiKey = dailyConversationOpenaiApiKey.value();
  if (!apiKey) {
    logger.error('OPENAI_API_KEY is missing in the Functions runtime.');
    throw new Error('LLM_UNAVAILABLE');
  }

  const systemPrompt = `${assembleDailyConversationPrompt({
    incomingFocus: input.incomingFocus,
    previousMemory: input.previousMemory,
  })}

Advisory phase (server-set, do not return session counters): ${input.suggestedPhase}
Trusted user-message count: ${input.turnCount}
${dailyConversationCompletionHint(input.turnCount, input.wrapUp === true)}`;

  const client = new OpenAI({ apiKey });
  const completion = await client.chat.completions.create({
    model: MODEL,
    temperature: input.wrapUp ? 0.8 : 0.5,
    max_tokens: 900,
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'daily_conversation_turn',
        strict: true,
        schema: TURN_SCHEMA,
      },
    },
    messages: [
      { role: 'system', content: systemPrompt },
      ...input.messages.map((item) => ({
        role: item.role,
        content: item.content,
      })),
    ],
  });

  const text = completion.choices[0]?.message?.content?.trim();
  if (!text) {
    logger.error('Daily Conversation OpenAI returned an empty message.', {
      id: completion.id,
      finishReason: completion.choices[0]?.finish_reason ?? null,
    });
    throw new Error('LLM_UNAVAILABLE');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(text) as unknown;
  } catch {
    logger.error('Daily Conversation OpenAI returned non-JSON content.');
    throw new Error('LLM_UNAVAILABLE');
  }

  const turn = sanitizeDailyConversationModelOutput(parsed);
  if (!turn) {
    logger.error('Daily Conversation OpenAI JSON was not a usable turn.');
    throw new Error('LLM_UNAVAILABLE');
  }

  return turn;
}
