import {
  THEME_BUNDLE_CREDIT_COUNT,
  THEME_DURATION_DAYS,
  challengeFromBlueprint,
  getBlueprintForThemeDay,
  getChallengeBlueprint,
  getExampleStatement,
  type MockWorld,
} from '@/data/mock';
import { getMockSessionNotes } from '@/data/programmes/self-esteem-mock-conversation';
import { addCalendarDays, compareIsoDates, isIsoDateOnOrBefore, isSameIsoDate } from '@/lib/calendar';
import type {
  Challenge,
  ChallengeMessage,
  CompletedChallenge,
  HomeState,
  IsoDate,
  StatementOfTheDay,
} from '@/types/models';
import type { ThemeProgress, UserProgress } from '@/types/progress';

function clampDay(day: number): number {
  return Math.min(THEME_DURATION_DAYS, Math.max(1, Math.round(day)));
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

export function getPreviousCompletions(world: MockWorld): CompletedChallenge[] {
  return world.statements
    .filter((item) => item.date !== world.today)
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
    sessions: world.sessions.filter((item) => !removedIds.has(item.challengeId)),
    statements: world.statements.filter((item) => !removedIds.has(item.challengeId)),
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

export function getThemeCredits(world: MockWorld): number {
  return Math.max(0, world.userProgress.themeCredits ?? 0);
}

export function setThemeCredits(world: MockWorld, count: number): MockWorld {
  return {
    ...world,
    userProgress: {
      ...world.userProgress,
      themeCredits: Math.max(0, Math.round(count)),
    },
  };
}

function withCredits(world: MockWorld, themeCredits: number): MockWorld {
  return {
    ...world,
    userProgress: {
      ...world.userProgress,
      themeCredits: Math.max(0, themeCredits),
    },
  };
}

/** Mock €3 purchase: unlock this theme only. Credits unchanged. */
export function unlockThemeWithSinglePurchase(world: MockWorld, themeId: string): MockWorld {
  if (getThemeProgress(world, themeId)) {
    return selectTheme(world, themeId);
  }
  return unlockTheme(world, themeId);
}

/** Mock €6 bundle: unlock this theme and add two credits. */
export function unlockThemeWithBundlePurchase(world: MockWorld, themeId: string): MockWorld {
  if (getThemeProgress(world, themeId)) {
    return selectTheme(world, themeId);
  }
  const unlocked = unlockTheme(world, themeId);
  return withCredits(unlocked, getThemeCredits(unlocked) + THEME_BUNDLE_CREDIT_COUNT);
}

/** Spend one credit to unlock this theme. No-op if owned or no credits. */
export function unlockThemeWithCredit(world: MockWorld, themeId: string): MockWorld {
  if (getThemeProgress(world, themeId)) {
    return selectTheme(world, themeId);
  }
  const credits = getThemeCredits(world);
  if (credits < 1) {
    return world;
  }
  return withCredits(unlockTheme(world, themeId), credits - 1);
}

/** Drop ownership and credits; keep streak and calendar. */
export function resetEntitlements(world: MockWorld): MockWorld {
  const cleared = resetAllProgress(world, world.today);
  return {
    ...cleared,
    userProgress: {
      ...world.userProgress,
      themeCredits: 0,
    },
  };
}

export type CompleteSessionOptions = {
  finalStatement?: string | null;
};

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

  const notes = getMockSessionNotes(todayChallenge.id);
  const statementText =
    options?.finalStatement?.trim() ||
    notes?.dailyExercise ||
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
  const nextSession = {
    id: `session-${world.user.id}-${todayChallenge.id}`,
    userId: world.user.id,
    challengeId: todayChallenge.id,
    status: 'completed' as const,
    messages,
    statementId: nextStatement.id,
    notes,
  };

  const finishedProgramme = progress.currentDay >= THEME_DURATION_DAYS;
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
    sessions: [nextSession, ...world.sessions],
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
  const nextDay = clampDay(day);
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
    userProgress: { currentStreak: 0, themeCredits: 0 },
    themeProgress: [],
    challenges: [],
    sessions: [],
    statements: [],
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
    { themeId: 'theme-presence', day: 5 },
    { themeId: 'theme-jealousy', day: 8 },
    { themeId: 'theme-work', day: 2 },
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
      themeCredits: 0,
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
