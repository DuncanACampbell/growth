import {
  canPurchaseTheme,
  challengeFromBlueprint,
  getBlueprintForThemeDay,
  getChallengeBlueprint,
  getExampleStatement,
  getThemeDurationDays,
  type MockWorld,
} from '@/data/mock';
import { MONEY_PROGRAMME } from '@/data/programmes/money';
import { SELF_ESTEEM_PROGRAMME } from '@/data/programmes/self-esteem';
import { addCalendarDays, compareIsoDates, isIsoDateOnOrBefore, isSameIsoDate } from '@/lib/calendar';
import type {
  Challenge,
  ChallengeMessage,
  ChallengeSession,
  CompletedChallenge,
  HomeState,
  IsoDate,
  ProgrammeMemoryRecord,
  StatementOfTheDay,
} from '@/types/models';
import type { ThemeProgress, UserProgress } from '@/types/progress';

function clampDay(day: number, themeId: string): number {
  return Math.min(getThemeDurationDays(themeId), Math.max(1, Math.round(day)));
}

function isWaitingToday(progress: ThemeProgress, today: IsoDate): boolean {
  return (
    progress.status === 'active' &&
    progress.currentSessionStatus === 'waiting' &&
    isIsoDateOnOrBefore(progress.currentSessionAvailableAt, today)
  );
}

function isQueuedForLater(progress: ThemeProgress, today: IsoDate): boolean {
  return (
    progress.status === 'active' &&
    progress.currentSessionStatus === 'waiting' &&
    compareIsoDates(progress.currentSessionAvailableAt, today) > 0
  );
}

function completedDayNumber(progress: ThemeProgress): number {
  if (progress.status === 'completed') {
    return progress.currentDay;
  }
  return progress.currentDay - 1;
}

/** Session finished today — used so Home can show that day's statement. */
export function getCompletedTodayChallenge(
  world: MockWorld,
  themeId: string | null,
): Challenge | null {
  const progress = getThemeProgress(world, themeId);
  if (!progress || !themeId || !didCompleteThemeToday(world, themeId)) {
    return null;
  }
  const day = completedDayNumber(progress);
  if (day < 1) {
    return null;
  }
  return challengeForDay(themeId, day, progress.lastCompletedAt ?? world.today);
}

export function shiftThemeDay(world: MockWorld, themeId: string, delta: number): MockWorld {
  const progress = getThemeProgress(world, themeId);
  if (!progress) {
    return delta > 0 ? unlockTheme(world, themeId) : world;
  }
  if (
    delta > 0 &&
    isQueuedForLater(progress, world.today)
  ) {
    return {
      ...world,
      user: {
        ...world.user,
        selectedThemeId: themeId,
      },
      themeProgress: replaceThemeProgress(world, {
        ...progress,
        currentSessionAvailableAt: world.today,
      }),
    };
  }
  return setThemeDay(world, themeId, progress.currentDay + delta);
}

export function getThemeProgress(
  world: MockWorld,
  themeId: string | null | undefined,
): ThemeProgress | null {
  if (!themeId) {
    return null;
  }
  return world.themeProgress.find((item) => item.themeId === themeId) ?? null;
}

export function getWaitingThemeProgress(world: MockWorld): ThemeProgress[] {
  return world.themeProgress.filter((item) => isWaitingToday(item, world.today));
}

function challengeForDay(
  themeId: string,
  day: number,
  date: IsoDate,
): Challenge | null {
  const blueprint = getBlueprintForThemeDay(themeId, day);
  if (!blueprint) {
    return null;
  }
  return challengeFromBlueprint(blueprint, date);
}

export function getCompletedExerciseCount(world: MockWorld, themeId: string): number {
  const ids = new Set(
    world.statements
      .filter((item) => item.themeId === themeId)
      .map((item) => item.exerciseId || item.challengeId),
  );
  return ids.size;
}

export function isProgrammeComplete(world: MockWorld, themeId: string): boolean {
  const progress = getThemeProgress(world, themeId);
  const totalDays = getThemeDurationDays(themeId);
  return (
    progress?.status === 'completed' ||
    getCompletedExerciseCount(world, themeId) >= totalDays
  );
}

export function getCurrentExerciseDay(world: MockWorld, themeId: string): number {
  const progress = getThemeProgress(world, themeId);
  const totalDays = getThemeDurationDays(themeId);
  if (!progress) {
    return 1;
  }
  if (progress.status === 'completed') {
    return totalDays;
  }
  return progress.currentDay;
}

export function getProgrammeProgress(
  world: MockWorld,
  themeId: string,
): {
  currentDay: number;
  completedCount: number;
  totalDays: number;
  isComplete: boolean;
} {
  const totalDays = getThemeDurationDays(themeId);
  return {
    currentDay: getCurrentExerciseDay(world, themeId),
    completedCount: getCompletedExerciseCount(world, themeId),
    totalDays,
    isComplete: isProgrammeComplete(world, themeId),
  };
}

export function isExerciseCompleted(world: MockWorld, exerciseId: string): boolean {
  return world.statements.some(
    (item) => item.exerciseId === exerciseId || item.challengeId === exerciseId,
  );
}

export function isExerciseUnlocked(
  world: MockWorld,
  themeId: string,
  exerciseId: string,
): boolean {
  const progress = getThemeProgress(world, themeId);
  if (!progress) {
    return false;
  }
  const day = exerciseSequenceNumber(exerciseId);
  if (day < 1 || day === Number.MAX_SAFE_INTEGER) {
    return false;
  }
  if (isExerciseCompleted(world, exerciseId)) {
    return day <= getThemeDurationDays(themeId);
  }
  return isExerciseAvailableToStart(world, themeId, exerciseId);
}

export function isExerciseAvailableToStart(
  world: MockWorld,
  themeId: string,
  exerciseId: string,
): boolean {
  const progress = getThemeProgress(world, themeId);
  if (!progress || !isWaitingToday(progress, world.today)) {
    return false;
  }
  return (
    exerciseSequenceNumber(exerciseId) === progress.currentDay &&
    !isExerciseCompleted(world, exerciseId)
  );
}

export function getChallengeForExercise(
  world: MockWorld,
  themeId: string,
  exerciseId: string,
): Challenge | null {
  const day = exerciseSequenceNumber(exerciseId);
  if (day < 1 || day === Number.MAX_SAFE_INTEGER) {
    return null;
  }
  const existing = world.challenges.find((item) => item.id === exerciseId);
  const date =
    existing?.date ??
    world.statements.find((item) => item.exerciseId === exerciseId)?.date ??
    world.today;
  return challengeForDay(themeId, day, date);
}

export function getStatementForChallenge(
  world: MockWorld,
  challengeId: string | null,
): StatementOfTheDay | null {
  if (!challengeId) {
    return null;
  }
  return (
    world.statements.find(
      (item) => item.challengeId === challengeId || item.exerciseId === challengeId,
    ) ?? null
  );
}

export function getLatestStatementForTheme(
  world: MockWorld,
  themeId: string,
): StatementOfTheDay | null {
  const items = world.statements.filter((item) => item.themeId === themeId);
  if (items.length === 0) {
    return null;
  }
  return (
    items.slice().sort((a, b) => {
      const byExercise =
        exerciseSequenceNumber(b.exerciseId) - exerciseSequenceNumber(a.exerciseId);
      if (byExercise !== 0) {
        return byExercise;
      }
      return (b.date ?? '').localeCompare(a.date ?? '');
    })[0] ?? null
  );
}

/**
 * The conversation to show for a theme: a waiting session if it is due,
 * otherwise the session completed today (so Home/Challenge can still show it).
 */
export function getTodaysChallenge(
  world: MockWorld,
  themeId: string | null,
): Challenge | null {
  const progress = getThemeProgress(world, themeId);
  if (!progress || !themeId) {
    return null;
  }

  if (isWaitingToday(progress, world.today)) {
    return challengeForDay(
      themeId,
      progress.currentDay,
      progress.currentSessionAvailableAt,
    );
  }

  if (didCompleteThemeToday(world, themeId)) {
    const completedDay = completedDayNumber(progress);
    if (completedDay >= 1) {
      return challengeForDay(themeId, completedDay, progress.lastCompletedAt ?? world.today);
    }
  }

  return null;
}

export function getTodaysStatement(
  world: MockWorld,
  challengeId: string | null,
): StatementOfTheDay | null {
  if (!challengeId) {
    return null;
  }
  return (
    world.statements.find(
      (item) => item.challengeId === challengeId && item.date === world.today,
    ) ?? null
  );
}

/** Completed exercises for one theme, programme order (Day 1 first). */
export type ThemeExerciseHistoryItem = {
  exerciseId: string;
  day: number;
  title: string;
  completedAt: IsoDate;
  statement: string;
  memory: ProgrammeMemoryRecord | null;
};

export function getThemeExerciseHistory(
  world: MockWorld,
  themeId: string,
): ThemeExerciseHistoryItem[] {
  const items = world.statements
    .filter((item) => item.themeId === themeId)
    .map((statement) => {
      const exerciseId = statement.exerciseId || statement.challengeId;
      const challenge = getChallengeForExercise(world, themeId, exerciseId);
      if (!challenge) {
        return null;
      }
      const memory =
        (world.programmeMemories ?? []).find(
          (item) => item.themeId === themeId && item.exerciseId === exerciseId,
        ) ?? null;
      return {
        exerciseId,
        day: challenge.day,
        title: challenge.title,
        completedAt: statement.date,
        statement: statement.text,
        memory,
      } satisfies ThemeExerciseHistoryItem;
    })
    .filter((item): item is ThemeExerciseHistoryItem => item !== null);

  const byExercise = new Map<string, ThemeExerciseHistoryItem>();
  for (const item of items) {
    const existing = byExercise.get(item.exerciseId);
    if (!existing || existing.completedAt <= item.completedAt) {
      byExercise.set(item.exerciseId, item);
    }
  }

  return [...byExercise.values()].sort((a, b) => a.day - b.day);
}

export function getPreviousCompletions(world: MockWorld): CompletedChallenge[] {
  const latestIds = new Set(
    world.themeProgress
      .map((progress) => getLatestStatementForTheme(world, progress.themeId)?.id)
      .filter((id): id is string => Boolean(id)),
  );
  return world.statements
    .filter((item) => !latestIds.has(item.id))
    .map((item) => {
      const challenge = world.challenges.find((entry) => entry.id === item.challengeId);
      if (!challenge) {
        return null;
      }
      return { challenge, statement: item };
    })
    .filter((item): item is CompletedChallenge => item !== null)
    .sort((a, b) => (a.challenge.date < b.challenge.date ? 1 : -1));
}

export function getHomeState(world: MockWorld): HomeState {
  if (world.themeProgress.length === 0) {
    return 'new';
  }
  if (getWaitingThemeProgress(world).length > 0) {
    return 'challenge_open';
  }
  return 'challenge_complete';
}

function applyStreak(progress: UserProgress, today: IsoDate): UserProgress {
  if (progress.lastActivityDate && isSameIsoDate(progress.lastActivityDate, today)) {
    return progress;
  }
  const yesterday = addCalendarDays(today, -1);
  const continued =
    progress.lastActivityDate !== undefined &&
    isSameIsoDate(progress.lastActivityDate, yesterday);
  return {
    ...progress,
    currentStreak: continued ? progress.currentStreak + 1 : 1,
    lastActivityDate: today,
  };
}

function replaceThemeProgress(
  world: MockWorld,
  next: ThemeProgress,
): ThemeProgress[] {
  const exists = world.themeProgress.some((item) => item.themeId === next.themeId);
  if (!exists) {
    return [...world.themeProgress, next];
  }
  return world.themeProgress.map((item) =>
    item.themeId === next.themeId ? next : item,
  );
}

function pruneThemeRecords(world: MockWorld, themeId: string, fromDay: number): MockWorld {
  const removedIds = new Set(
    world.challenges
      .filter((item) => item.themeId === themeId && item.day >= fromDay)
      .map((item) => item.id),
  );
  return {
    ...world,
    challenges: world.challenges.filter((item) => !removedIds.has(item.id)),
    sessions: world.sessions.filter((item) => {
      const exerciseId = item.exerciseId || item.challengeId;
      if (removedIds.has(item.challengeId) || removedIds.has(exerciseId)) {
        return false;
      }
      if (item.themeId === themeId && exerciseSequenceNumber(exerciseId) >= fromDay) {
        return false;
      }
      return true;
    }),
    statements: world.statements.filter((item) => !removedIds.has(item.challengeId)),
    programmeMemories: (world.programmeMemories ?? []).filter(
      (item) => !removedIds.has(item.exerciseId),
    ),
  };
}

export function selectTheme(world: MockWorld, themeId: string): MockWorld {
  return {
    ...world,
    user: {
      ...world.user,
      selectedThemeId: themeId,
    },
  };
}

export function unlockTheme(world: MockWorld, themeId: string): MockWorld {
  if (!canPurchaseTheme(themeId)) {
    return world;
  }
  if (getThemeProgress(world, themeId)) {
    return selectTheme(world, themeId);
  }
  const progress: ThemeProgress = {
    themeId,
    purchasedAt: world.today,
    currentDay: 1,
    status: 'active',
    currentSessionStatus: 'waiting',
    currentSessionAvailableAt: world.today,
  };
  return {
    ...selectTheme(world, themeId),
    themeProgress: [...world.themeProgress, progress],
  };
}

/** Mock €3 purchase: unlock this theme only. */
export function purchaseTheme(world: MockWorld, themeId: string): MockWorld {
  return unlockTheme(world, themeId);
}

/** Drop theme ownership; keep streak and calendar. */
export function resetEntitlements(world: MockWorld): MockWorld {
  const cleared = resetAllProgress(world, world.today);
  return {
    ...cleared,
    userProgress: {
      currentStreak: world.userProgress.currentStreak,
      lastActivityDate: world.userProgress.lastActivityDate,
    },
  };
}

function exerciseSequenceNumber(exerciseId: string): number {
  const match = exerciseId.match(/(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
}

function upsertProgrammeMemory(
  world: MockWorld,
  record: ProgrammeMemoryRecord,
): ProgrammeMemoryRecord[] {
  const existing = world.programmeMemories ?? [];
  const without = existing.filter(
    (item) => !(item.themeId === record.themeId && item.exerciseId === record.exerciseId),
  );
  return [...without, record];
}

/** Earlier completed memories in this theme, oldest first. Excludes the current exercise and later ones. */
export function getPriorProgrammeMemories(
  world: MockWorld,
  themeId: string,
  currentExerciseId: string,
): ProgrammeMemoryRecord[] {
  const current = exerciseSequenceNumber(currentExerciseId);
  const completedExerciseIds = new Set(
    world.statements.map((item) => item.exerciseId || item.challengeId),
  );
  return (world.programmeMemories ?? [])
    .filter(
      (item) =>
        item.themeId === themeId &&
        completedExerciseIds.has(item.exerciseId) &&
        exerciseSequenceNumber(item.exerciseId) < current,
    )
    .slice()
    .sort((a, b) => {
      const byExercise =
        exerciseSequenceNumber(a.exerciseId) - exerciseSequenceNumber(b.exerciseId);
      if (byExercise !== 0) {
        return byExercise;
      }
      return (a.completedAt ?? '').localeCompare(b.completedAt ?? '');
    });
}

export type CompleteSessionOptions = {
  finalStatement?: string | null;
  memory?: ProgrammeMemoryRecord | null;
  messages?: ChallengeMessage[] | null;
};

const DEV_PLACEHOLDER_STATEMENT = 'Development completion placeholder.';

/** Testing helper: complete the current day with a placeholder takeaway. */
export function developerCompleteOptions(
  themeId: string,
  exerciseId: string,
  messages?: ChallengeMessage[] | null,
): CompleteSessionOptions {
  return {
    finalStatement: DEV_PLACEHOLDER_STATEMENT,
    messages,
    memory: {
      themeId,
      exerciseId,
      topic: 'Developer placeholder completion',
      pattern:
        'The session was marked complete for testing without finishing the guided conversation.',
      reframe: DEV_PLACEHOLDER_STATEMENT,
      finalStatement: DEV_PLACEHOLDER_STATEMENT,
      memoryNote:
        'This day was completed with a developer placeholder. Prefer what the user says in later days.',
    },
  };
}

function sessionExerciseId(session: ChallengeSession): string {
  return session.exerciseId || session.challengeId;
}

/** Incomplete live chat for this exercise. Null if completed or never started. */
export function getInProgressSession(
  world: MockWorld,
  themeId: string,
  exerciseId: string,
): ChallengeSession | null {
  if (isExerciseCompleted(world, exerciseId)) {
    return null;
  }
  const match = world.sessions.find(
    (item) =>
      item.status === 'in_progress' &&
      sessionExerciseId(item) === exerciseId &&
      (!item.themeId || item.themeId === themeId) &&
      item.messages.length > 0,
  );
  return match ?? null;
}

export function upsertInProgressSession(
  world: MockWorld,
  input: {
    themeId: string;
    exerciseId: string;
    messages: ChallengeMessage[];
    sessionId?: string;
  },
): MockWorld {
  if (isExerciseCompleted(world, input.exerciseId) || input.messages.length === 0) {
    return world;
  }

  const now = new Date().toISOString();
  const existing = world.sessions.find(
    (item) =>
      item.status === 'in_progress' &&
      sessionExerciseId(item) === input.exerciseId &&
      (!item.themeId || item.themeId === input.themeId),
  );
  const session: ChallengeSession = {
    id: existing?.id ?? input.sessionId ?? `session-${world.user.id}-${input.exerciseId}`,
    userId: world.user.id,
    challengeId: input.exerciseId,
    themeId: input.themeId,
    exerciseId: input.exerciseId,
    status: 'in_progress',
    messages: input.messages,
    statementId: null,
    notes: null,
    startedAt: existing?.startedAt ?? now,
    updatedAt: now,
  };
  const challenge = getChallengeForExercise(world, input.themeId, input.exerciseId);
  const hasChallenge =
    !challenge || world.challenges.some((item) => item.id === input.exerciseId);

  return {
    ...world,
    challenges:
      challenge && !hasChallenge ? [challenge, ...world.challenges] : world.challenges,
    sessions: [
      session,
      ...world.sessions.filter(
        (item) =>
          !(
            item.status === 'in_progress' &&
            sessionExerciseId(item) === input.exerciseId
          ),
      ),
    ],
  };
}

export function completeThemeSession(
  world: MockWorld,
  themeId: string,
  options?: CompleteSessionOptions,
): MockWorld {
  const progress = getThemeProgress(world, themeId);
  if (!progress || !isWaitingToday(progress, world.today)) {
    return world;
  }

  const todayChallenge = challengeForDay(
    themeId,
    progress.currentDay,
    progress.currentSessionAvailableAt,
  );
  const blueprint = getChallengeBlueprint(todayChallenge?.id);
  if (!todayChallenge || !blueprint) {
    return world;
  }

  const messages: ChallengeMessage[] = blueprint.turns.flatMap((turn, index) => [
    {
      id: `live-${themeId}-g-${index}`,
      role: 'guide',
      text: turn.guideText,
    },
    {
      id: `live-${themeId}-u-${index}`,
      role: 'user',
      text: turn.userReply,
    },
  ]);

  const statementText =
    options?.finalStatement?.trim() ||
    getExampleStatement(todayChallenge.id) ||
    todayChallenge.title;
  const nextStatement: StatementOfTheDay = {
    id: `statement-${world.user.id}-${todayChallenge.id}`,
    userId: world.user.id,
    challengeId: todayChallenge.id,
    themeId,
    exerciseId: todayChallenge.id,
    date: world.today,
    text: statementText,
  };
  const live = getInProgressSession(world, themeId, todayChallenge.id);
  const now = new Date().toISOString();
  const sessionMessages =
    options?.messages && options.messages.length > 0
      ? options.messages
      : live?.messages.length
        ? live.messages
        : messages;
  const nextSession: ChallengeSession = {
    id: live?.id ?? `session-${world.user.id}-${todayChallenge.id}`,
    userId: world.user.id,
    challengeId: todayChallenge.id,
    themeId,
    exerciseId: todayChallenge.id,
    status: 'completed',
    messages: sessionMessages,
    statementId: nextStatement.id,
    notes: null,
    startedAt: live?.startedAt ?? now,
    updatedAt: now,
  };

  const finishedProgramme = progress.currentDay >= getThemeDurationDays(themeId);
  const nextProgress: ThemeProgress = finishedProgramme
    ? {
        ...progress,
        status: 'completed',
        currentSessionStatus: 'completed',
        lastCompletedAt: world.today,
      }
    : {
        ...progress,
        currentDay: progress.currentDay + 1,
        status: 'active',
        currentSessionStatus: 'waiting',
        currentSessionAvailableAt: addCalendarDays(world.today, 1),
        lastCompletedAt: world.today,
      };

  const nextMemories = options?.memory
    ? upsertProgrammeMemory(world, {
        ...options.memory,
        exerciseId: todayChallenge.id,
        finalStatement: statementText,
        completedAt: world.today,
      })
    : (world.programmeMemories ?? []);

  const hasChallenge = world.challenges.some((item) => item.id === todayChallenge.id);

  return {
    ...world,
    user: {
      ...world.user,
      selectedThemeId: themeId,
    },
    userProgress: applyStreak(world.userProgress, world.today),
    themeProgress: replaceThemeProgress(world, nextProgress),
    challenges: hasChallenge ? world.challenges : [todayChallenge, ...world.challenges],
    statements: [nextStatement, ...world.statements],
    sessions: [
      nextSession,
      ...world.sessions.filter(
        (item) => sessionExerciseId(item) !== todayChallenge.id,
      ),
    ],
    programmeMemories: nextMemories,
  };
}

export function completeTodaysChallenge(
  world: MockWorld,
  themeId?: string | null,
  options?: CompleteSessionOptions,
): MockWorld {
  const id = themeId ?? world.user.selectedThemeId;
  if (!id) {
    return world;
  }
  return completeThemeSession(world, id, options);
}

export function resetTheme(world: MockWorld, themeId: string): MockWorld {
  const pruned = pruneThemeRecords(world, themeId, 1);
  return {
    ...pruned,
    themeProgress: pruned.themeProgress.filter((item) => item.themeId !== themeId),
    user: {
      ...pruned.user,
      selectedThemeId:
        pruned.user.selectedThemeId === themeId
          ? pruned.themeProgress.find((item) => item.themeId !== themeId)?.themeId ??
            null
          : pruned.user.selectedThemeId,
    },
  };
}

export function setThemeDay(world: MockWorld, themeId: string, day: number): MockWorld {
  const nextDay = clampDay(day, themeId);
  const unlocked = getThemeProgress(world, themeId) ? world : unlockTheme(world, themeId);
  const pruned = pruneThemeRecords(unlocked, themeId, nextDay);
  const nextProgress: ThemeProgress = {
    themeId,
    purchasedAt: getThemeProgress(unlocked, themeId)?.purchasedAt ?? pruned.today,
    currentDay: nextDay,
    status: 'active',
    currentSessionStatus: 'waiting',
    currentSessionAvailableAt: pruned.today,
  };
  return {
    ...pruned,
    user: {
      ...pruned.user,
      selectedThemeId: themeId,
    },
    themeProgress: replaceThemeProgress(pruned, nextProgress),
  };
}

export function resetAllProgress(world: MockWorld, today: IsoDate): MockWorld {
  return {
    ...world,
    today,
    user: {
      ...world.user,
      selectedThemeId: null,
    },
    userProgress: { currentStreak: 0 },
    themeProgress: [],
    challenges: [],
    sessions: [],
    statements: [],
    programmeMemories: [],
  };
}

export function resetStreak(world: MockWorld): MockWorld {
  return {
    ...world,
    userProgress: {
      ...world.userProgress,
      currentStreak: 0,
    },
  };
}

export function advanceCalendarDay(world: MockWorld): MockWorld {
  return {
    ...world,
    today: addCalendarDays(world.today, 1),
  };
}

export function loadThreeThemeScenario(world: MockWorld): MockWorld {
  const today = world.today;
  const specs: { themeId: string; day: number }[] = [
    { themeId: SELF_ESTEEM_PROGRAMME.themeId, day: 5 },
    { themeId: MONEY_PROGRAMME.themeId, day: 4 },
    { themeId: 'theme-relationships', day: 2 },
  ];
  let next = resetAllProgress(world, today);
  for (const spec of specs) {
    next = setThemeDay(next, spec.themeId, spec.day);
  }
  return {
    ...next,
    userProgress: {
      currentStreak: 3,
      lastActivityDate: addCalendarDays(today, -1),
    },
  };
}

export function didCompleteThemeToday(world: MockWorld, themeId: string): boolean {
  const progress = getThemeProgress(world, themeId);
  return Boolean(
    progress?.lastCompletedAt && isSameIsoDate(progress.lastCompletedAt, world.today),
  );
}

export function isThemeAvailableToday(world: MockWorld, themeId: string): boolean {
  const progress = getThemeProgress(world, themeId);
  return Boolean(progress && isWaitingToday(progress, world.today));
}
