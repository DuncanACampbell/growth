import {
  normalizeDailyConversationCompletedAt,
  parseStoredDailyConversationMemory,
} from './memory';
import { createDailyConversationOpening } from './opening';
import { createInitialDailyConversationState } from './session';

function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(message);
  }
}

function stringifyResponse(previousMemory: unknown): void {
  const payload = {
    message: createDailyConversationOpening(previousMemory),
    state: createInitialDailyConversationState(),
    previousMemory,
  };
  JSON.parse(JSON.stringify(payload));
}

const validMemory = parseStoredDailyConversationMemory({
  topic: 'sleep',
  situation: 'Staying up too late.',
  insight: 'The late nights are a way of avoiding tomorrow.',
  followUp: 'Did you get to bed earlier?',
  finalThought: 'One earlier night is enough to start.',
  completedAt: '2026-08-27T20:00:00.000Z',
});

assert(validMemory != null, 'B: valid prior memory should parse');

// A. no prior memory → first-day opening, serializable
const firstDay = createDailyConversationOpening(null);
assert(firstDay.includes('on your mind'), 'A: fresh opening');
stringifyResponse(null);

// B. valid prior memory → returning opening, serializable
const returning = createDailyConversationOpening(validMemory);
assert(returning.includes('sleep'), 'B: returning opening uses topic');
stringifyResponse(validMemory);

// C. malformed prior memory → ignored, first-day opening
const malformed = parseStoredDailyConversationMemory({ topic: 'only-topic' });
assert(malformed == null, 'C: malformed memory is ignored');
stringifyResponse(malformed);

// D. today's completed document shape must parse without throwing
const todayDocMemory = parseStoredDailyConversationMemory({
  topic: 'today',
  situation: 'A conversation from earlier today.',
  insight: 'It is okay to stop here.',
  finalThought: 'Leave it until tomorrow.',
});
assert(todayDocMemory != null, 'D: completed document memory parses');
stringifyResponse(todayDocMemory);

// E. Timestamp-like completedAt must normalize, not throw
const timestampMemory = parseStoredDailyConversationMemory({
  topic: 'money worry',
  situation: 'Avoiding a bill.',
  insight: 'The bill is smaller than the dread.',
  finalThought: 'Open the envelope.',
  completedAt: {
    toDate: () => new Date('2026-08-26T18:00:00.000Z'),
  },
});
assert(timestampMemory != null, 'E: Timestamp completedAt still parses');
assert(
  timestampMemory?.completedAt === '2026-08-26T18:00:00.000Z',
  'E: Timestamp completedAt is normalized',
);
assert(
  normalizeDailyConversationCompletedAt({ seconds: 1_777_000_000 }).includes(
    'T',
  ),
  'E: proto seconds normalize',
);
stringifyResponse(timestampMemory);

console.log('opening-safety-check: all cases passed');
