/** Compact cross-day notes from a completed exercise. Not a transcript. */
export type ProgrammeMemoryFields = {
  topic: string;
  pattern: string;
  reframe: string;
  memoryNote: string;
};

export type ProgrammeMemoryRecord = ProgrammeMemoryFields & {
  themeId: string;
  exerciseId: string;
  finalStatement: string;
  completedAt?: string;
};

const MAX_MEMORY_ITEMS = 6;
const MAX_FIELD_LENGTH = 500;

export function parseProgrammeMemoryFields(
  value: unknown,
): ProgrammeMemoryFields | null {
  if (value === null || value === undefined || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const topic = trimField(record.topic);
  const pattern = trimField(record.pattern);
  const reframe = trimField(record.reframe);
  const memoryNote = trimField(record.memoryNote);
  if (!topic || !pattern || !reframe || !memoryNote) {
    return null;
  }
  return { topic, pattern, reframe, memoryNote };
}

export function parseProgrammeMemoryRecord(
  value: unknown,
): ProgrammeMemoryRecord | null {
  if (value === null || typeof value !== 'object') {
    return null;
  }
  const record = value as Record<string, unknown>;
  const fields = parseProgrammeMemoryFields(value);
  const themeId = trimField(record.themeId);
  const exerciseId = trimField(record.exerciseId);
  const finalStatement = trimField(record.finalStatement);
  if (!fields || !themeId || !exerciseId || !finalStatement) {
    return null;
  }
  const completedAt = trimField(record.completedAt);
  return {
    themeId,
    exerciseId,
    ...fields,
    finalStatement,
    ...(completedAt ? { completedAt } : {}),
  };
}

export function parseProgrammeMemoryList(value: unknown): ProgrammeMemoryRecord[] {
  if (value === undefined) {
    return [];
  }
  if (!Array.isArray(value)) {
    throw new Error('previousMemory must be an array.');
  }
  if (value.length > MAX_MEMORY_ITEMS) {
    throw new Error('previousMemory is too long.');
  }
  const records: ProgrammeMemoryRecord[] = [];
  for (const item of value) {
    const parsed = parseProgrammeMemoryRecord(item);
    if (!parsed) {
      throw new Error('previousMemory items are invalid.');
    }
    records.push(parsed);
  }
  return records;
}

export function fallbackProgrammeMemory(
  finalStatement: string,
): ProgrammeMemoryFields {
  return {
    topic: "Today's self-esteem conversation",
    pattern:
      'The user was examining a harsh way of judging themselves in a specific situation.',
    reframe: finalStatement,
    memoryNote:
      'Do not assume they fully accepted a reframe. Work from what they actually said, not from an implied breakthrough.',
  };
}

export function formatPreviousProgrammeMemory(
  records: ProgrammeMemoryRecord[],
): string {
  if (records.length === 0) {
    return '';
  }

  const blocks = records.map((item, index) => {
    const label = item.exerciseId || `earlier-day-${index + 1}`;
    const when = item.completedAt ? ` (${item.completedAt})` : '';
    return `Exercise ${label}${when}
Topic: ${item.topic}
Pattern: ${item.pattern}
Reframe: ${item.reframe}
Final statement: ${item.finalStatement}
Memory note: ${item.memoryNote}`;
  });

  return `## Previous programme memory
These compact records come from earlier completed exercises in the same theme. They are summaries, not transcripts, and they are not facts beyond their scope.

Use them only when they genuinely help today's exercise. Do not mention previous days by default. Do not open with "Yesterday you said..." or "Last time we talked about...". If a record is not relevant, ignore it. If today's answer contradicts a record, trust what the user is saying now. Do not tell the user "You always..." or "You are the kind of person who..." unless current and previous evidence strongly support it and it is genuinely appropriate.

If this is the last day of the programme, you may draw on two or three highly relevant connections. Do not produce a report of the whole week.

${blocks.join('\n\n')}`;
}

function trimField(value: unknown): string {
  if (typeof value !== 'string') {
    return '';
  }
  return value.trim().slice(0, MAX_FIELD_LENGTH);
}
