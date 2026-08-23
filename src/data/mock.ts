import type {
  Challenge,
  ChallengeMessage,
  ChallengeSession,
  CompletedChallenge,
  HomeState,
  IsoDate,
  StatementOfTheDay,
  Theme,
  User,
} from '@/types/models';
import type { DailySession, Programme } from '@/types/programme';

import { SELF_ESTEEM_MOCK_CONVERSATIONS } from '@/data/programmes/self-esteem-mock-conversation';
import { SELF_ESTEEM_PROGRAMME } from '@/data/programmes/self-esteem';

export type PersonaId = 'new' | 'incomplete' | 'complete';

export const MOCK_TODAY: IsoDate = '2026-08-21';

const PAST_DATES: IsoDate[] = ['2026-08-19', '2026-08-20'];

export const MOCK_THEMES: Theme[] = [
  {
    id: 'theme-presence',
    name: 'Building Self-Esteem',
    description:
      'A 7-day programme to notice self-judgment, test old beliefs, and practise self-respect.',
  },
  {
    id: 'theme-courage',
    name: 'Motivation',
    description:
      'Feel a surge of energy for achieving your goals after doing our 30-day plan.',
  },
  {
    id: 'theme-discipline',
    name: 'Body confidence',
    description:
      'Looking in the mirror gets a lot easier with our plan for reinforcing your positive body beliefs',
  },
];

/**
 * One guided beat. `guideText` is what a future LLM would ask;
 * `userReply` stands in for the user until input is wired up.
 */
export type ChallengeTurn = {
  guideText: string;
  userReply: string;
};

/**
 * Catalog row for a theme's daily exercise. Later this maps cleanly to a
 * Firestore `challenges` document; `turns` will be replaced by LLM output.
 */
export type ChallengeBlueprint = {
  id: string;
  themeId: string;
  dayIndex: number;
  totalDays: number;
  title: string;
  prompt: string;
  turns: ChallengeTurn[];
  exampleStatement: string;
};

const PROGRAMMES: Programme[] = [SELF_ESTEEM_PROGRAMME];

export function getProgrammeForTheme(themeId: string): Programme | null {
  return PROGRAMMES.find((item) => item.themeId === themeId) ?? null;
}

export function getDailySession(
  sessionId: string | null | undefined,
): DailySession | null {
  if (!sessionId) {
    return null;
  }
  for (const programme of PROGRAMMES) {
    const session = programme.sessions.find((item) => item.id === sessionId);
    if (session) {
      return session;
    }
  }
  return null;
}

function progressLabel(day: number, totalDays: number): string {
  return `Day ${day} of ${totalDays}`;
}

function blueprintFromSession(
  session: DailySession,
  programme: Programme,
): ChallengeBlueprint {
  const mock = SELF_ESTEEM_MOCK_CONVERSATIONS[session.id];
  const label = progressLabel(session.day, programme.durationDays);
  return {
    id: session.id,
    themeId: programme.themeId,
    dayIndex: session.day,
    totalDays: programme.durationDays,
    title: label,
    prompt: label,
    turns: mock?.turns ?? [{ guideText: session.opening, userReply: '' }],
    exampleStatement: mock?.exampleStatement ?? '',
  };
}

function catalogBlueprintsForTheme(themeId: string): ChallengeBlueprint[] {
  const programme = getProgrammeForTheme(themeId);
  if (programme) {
    return programme.sessions
      .slice()
      .sort((a, b) => a.day - b.day)
      .map((session) => blueprintFromSession(session, programme));
  }

  const list = MOCK_CHALLENGE_BLUEPRINTS.filter((item) => item.themeId === themeId).sort(
    (a, b) => a.dayIndex - b.dayIndex,
  );
  return list.map((item) => ({ ...item, totalDays: list.length }));
}

const MOCK_CHALLENGE_BLUEPRINTS: Omit<ChallengeBlueprint, 'totalDays'>[] = [
  {
    id: 'challenge-courage-1',
    themeId: 'theme-courage',
    dayIndex: 1,
    title: 'Name the real goal',
    prompt: 'Get underneath busywork and name what you actually want.',
    turns: [
      {
        guideText: 'What goal has been sitting in the background this week?',
        userReply: 'I want to finish the first draft of my plan.',
      },
      {
        guideText: 'Why does that goal matter to you, in one sentence?',
        userReply: 'Because I am tired of circling and never starting.',
      },
      {
        guideText: 'What would “started” look like by tonight?',
        userReply: 'One page written, even if it is rough.',
      },
      {
        guideText: 'Turn that into a statement for today.',
        userReply: 'I write one rough page instead of circling.',
      },
    ],
    exampleStatement: 'I write one rough page instead of circling.',
  },
  {
    id: 'challenge-courage-2',
    themeId: 'theme-courage',
    dayIndex: 2,
    title: 'Shrink the next step',
    prompt: 'Make the next action small enough that you cannot honestly postpone it.',
    turns: [
      {
        guideText: 'What task feels heavy enough that you keep delaying it?',
        userReply: 'Outlining the whole project before I begin.',
      },
      {
        guideText: 'What is a version of that task that takes ten minutes or less?',
        userReply: 'List the three sections I already know.',
      },
      {
        guideText: 'When today will you do that ten-minute version?',
        userReply: 'Right after lunch, before I open messages.',
      },
    ],
    exampleStatement: 'After lunch I list three sections and begin.',
  },
  {
    id: 'challenge-courage-3',
    themeId: 'theme-courage',
    dayIndex: 3,
    title: 'Start again without drama',
    prompt: 'Treat a stall as a pause, then take one restart action.',
    turns: [
      {
        guideText: 'Where did your energy drop off recently?',
        userReply: 'I stopped after missing two mornings in a row.',
      },
      {
        guideText: 'What story did you tell yourself about that stall?',
        userReply: 'That I had already blown it, so why continue.',
      },
      {
        guideText: 'What is the smallest restart that would count today?',
        userReply: 'Open the doc and write for five minutes.',
      },
      {
        guideText: 'Say the restart as a calm statement, not a punishment.',
        userReply: 'I can start from here in five minutes.',
      },
    ],
    exampleStatement: 'I can start from here in five minutes.',
  },
  {
    id: 'challenge-discipline-1',
    themeId: 'theme-discipline',
    dayIndex: 1,
    title: 'What your body did',
    prompt: 'Thank your body for a function instead of grading its appearance.',
    turns: [
      {
        guideText: 'What is one thing your body did for you today?',
        userReply: 'It got me through a long walk to the shop.',
      },
      {
        guideText: 'How did that actually help your day?',
        userReply: 'I arrived clearer and less stuck in my head.',
      },
      {
        guideText: 'If you thanked your body for that, what would you say?',
        userReply: 'Thank you for carrying me when my mind was noisy.',
      },
    ],
    exampleStatement: 'Thank you for carrying me when my mind was noisy.',
  },
  {
    id: 'challenge-discipline-2',
    themeId: 'theme-discipline',
    dayIndex: 2,
    title: 'One kinder look',
    prompt: 'Practise looking at yourself without hunting for a flaw.',
    turns: [
      {
        guideText: 'What do you usually look for first in the mirror?',
        userReply: 'Whatever I think is wrong that day.',
      },
      {
        guideText: 'Name one neutral or kind detail you skipped past.',
        userReply: 'My eyes looked awake after sleeping well.',
      },
      {
        guideText: 'What happens if you let that be the first thing you notice?',
        userReply: 'The rest of the critique gets quieter.',
      },
      {
        guideText: 'Write a statement you can use the next time you look.',
        userReply: 'I look for what is well before what is wrong.',
      },
    ],
    exampleStatement: 'I look for what is well before what is wrong.',
  },
  {
    id: 'challenge-discipline-3',
    themeId: 'theme-discipline',
    dayIndex: 3,
    title: 'Wear what feels like you',
    prompt: 'Choose clothes for comfort and self-respect, not for hiding.',
    turns: [
      {
        guideText: 'What outfit do you reach for when you want to disappear?',
        userReply: 'The oversized jumper I hide in on low days.',
      },
      {
        guideText: 'What would feel like you today without performing for anyone?',
        userReply: 'The shirt that fits and still feels easy.',
      },
      {
        guideText: 'What would choosing that be saying to yourself?',
        userReply: 'I do not have to hide to be acceptable.',
      },
      {
        guideText: 'Turn that into today’s statement.',
        userReply: 'I do not have to hide to be acceptable.',
      },
    ],
    exampleStatement: 'I do not have to hide to be acceptable.',
  },
];

export type MockWorld = {
  personaId: PersonaId;
  user: User;
  themes: Theme[];
  challenges: Challenge[];
  sessions: ChallengeSession[];
  statements: StatementOfTheDay[];
};

export function getChallengeBlueprint(
  challengeId: string | null | undefined,
): ChallengeBlueprint | null {
  if (!challengeId) {
    return null;
  }
  for (const theme of MOCK_THEMES) {
    const match = catalogBlueprintsForTheme(theme.id).find((item) => item.id === challengeId);
    if (match) {
      return match;
    }
  }
  return null;
}

export function getThemeBlueprints(themeId: string): ChallengeBlueprint[] {
  return catalogBlueprintsForTheme(themeId);
}

const EMPTY_TURNS: ChallengeTurn[] = [];

export function getGuidedTurns(challengeId: string | null | undefined): ChallengeTurn[] {
  return getChallengeBlueprint(challengeId)?.turns ?? EMPTY_TURNS;
}

export function getExampleStatement(
  challengeId: string | null | undefined,
): string | null {
  return getChallengeBlueprint(challengeId)?.exampleStatement ?? null;
}

function challengeFromBlueprint(
  blueprint: ChallengeBlueprint,
  date: IsoDate,
): Challenge {
  return {
    id: blueprint.id,
    themeId: blueprint.themeId,
    date,
    title: blueprint.title,
    prompt: blueprint.prompt,
    day: blueprint.dayIndex,
    totalDays: blueprint.totalDays,
  };
}

function firstChallengeForEachTheme(): Challenge[] {
  return MOCK_THEMES.flatMap((theme) => {
    const first = getThemeBlueprints(theme.id)[0];
    return first ? [challengeFromBlueprint(first, MOCK_TODAY)] : [];
  });
}

function statement(
  userId: string,
  challenge: Challenge,
  text: string,
): StatementOfTheDay {
  return {
    id: `statement-${userId}-${challenge.id}`,
    userId,
    challengeId: challenge.id,
    date: challenge.date,
    text,
  };
}

function completedSession(
  userId: string,
  challenge: Challenge,
  statementId: string,
  messages: ChallengeMessage[],
): ChallengeSession {
  return {
    id: `session-${userId}-${challenge.id}`,
    userId,
    challengeId: challenge.id,
    status: 'completed',
    messages,
    statementId,
  };
}

function messagesFromBlueprint(
  blueprint: ChallengeBlueprint,
  prefix: string,
): ChallengeMessage[] {
  return blueprint.turns.flatMap((turn, index) => [
    {
      id: `${prefix}-g${index + 1}`,
      role: 'guide' as const,
      text: turn.guideText,
    },
    {
      id: `${prefix}-u${index + 1}`,
      role: 'user' as const,
      text: turn.userReply,
    },
  ]);
}

function worldForNewUser(): MockWorld {
  const user: User = {
    id: 'user-new',
    displayName: 'Alex',
    currentStreak: 0,
    selectedThemeId: null,
  };

  return {
    personaId: 'new',
    user,
    themes: MOCK_THEMES,
    challenges: firstChallengeForEachTheme(),
    sessions: [],
    statements: [],
  };
}

function worldForIncomplete(): MockWorld {
  const themeId = 'theme-courage';
  const plan = getThemeBlueprints(themeId);
  const user: User = {
    id: 'user-incomplete',
    displayName: 'Jordan',
    currentStreak: 4,
    selectedThemeId: themeId,
  };

  const past = PAST_DATES.map((date, index) => {
    const blueprint = plan[index];
    if (!blueprint) {
      return null;
    }
    return challengeFromBlueprint(blueprint, date);
  }).filter((item): item is Challenge => item !== null);

  const todayBlueprint = plan[PAST_DATES.length];
  const today = todayBlueprint
    ? challengeFromBlueprint(todayBlueprint, MOCK_TODAY)
    : null;

  const statements = past.map((item) =>
    statement(
      user.id,
      item,
      getExampleStatement(item.id) ?? item.title,
    ),
  );

  return {
    personaId: 'incomplete',
    user,
    themes: MOCK_THEMES,
    challenges: today ? [...past, today] : past,
    sessions: past.map((item, index) => {
      const blueprint = getChallengeBlueprint(item.id);
      return completedSession(
        user.id,
        item,
        statements[index]!.id,
        blueprint
          ? messagesFromBlueprint(blueprint, `incomplete-${item.id}`)
          : [],
      );
    }),
    statements,
  };
}

function worldForComplete(): MockWorld {
  const themeId = 'theme-presence';
  const plan = getThemeBlueprints(themeId);
  const user: User = {
    id: 'user-complete',
    displayName: 'Sam',
    currentStreak: 12,
    selectedThemeId: themeId,
  };

  const past = PAST_DATES.map((date, index) => {
    const blueprint = plan[index];
    if (!blueprint) {
      return null;
    }
    return challengeFromBlueprint(blueprint, date);
  }).filter((item): item is Challenge => item !== null);

  const todayBlueprint = plan[PAST_DATES.length];
  const today = todayBlueprint
    ? challengeFromBlueprint(todayBlueprint, MOCK_TODAY)
    : null;

  const pastStatements = past.map((item) =>
    statement(
      user.id,
      item,
      getExampleStatement(item.id) ?? item.title,
    ),
  );
  const todayStatement =
    today && todayBlueprint
      ? statement(user.id, today, todayBlueprint.exampleStatement)
      : null;
  const statements = todayStatement
    ? [todayStatement, ...pastStatements]
    : pastStatements;

  const challenges = today ? [...past, today] : past;

  return {
    personaId: 'complete',
    user,
    themes: MOCK_THEMES,
    challenges,
    sessions: [
      ...(today && todayStatement && todayBlueprint
        ? [
            completedSession(
              user.id,
              today,
              todayStatement.id,
              messagesFromBlueprint(todayBlueprint, `complete-${today.id}`),
            ),
          ]
        : []),
      ...past.map((item, index) => {
        const blueprint = getChallengeBlueprint(item.id);
        return completedSession(
          user.id,
          item,
          pastStatements[index]!.id,
          blueprint ? messagesFromBlueprint(blueprint, `complete-${item.id}`) : [],
        );
      }),
    ],
    statements,
  };
}

export function createMockWorld(personaId: PersonaId): MockWorld {
  switch (personaId) {
    case 'new':
      return worldForNewUser();
    case 'incomplete':
      return worldForIncomplete();
    case 'complete':
      return worldForComplete();
  }
}

export function getTheme(world: MockWorld, themeId: string | null): Theme | null {
  if (!themeId) {
    return null;
  }
  return world.themes.find((theme) => theme.id === themeId) ?? null;
}

export function getTodaysChallenge(
  world: MockWorld,
  themeId: string | null,
): Challenge | null {
  if (!themeId) {
    return null;
  }

  const datedToday = world.challenges.find(
    (challenge) => challenge.themeId === themeId && challenge.date === MOCK_TODAY,
  );
  if (datedToday) {
    return datedToday;
  }

  const completedIds = new Set(
    world.sessions
      .filter((session) => session.status === 'completed')
      .map((session) => session.challengeId),
  );
  const next = getThemeBlueprints(themeId).find(
    (blueprint) => !completedIds.has(blueprint.id),
  );

  return next ? challengeFromBlueprint(next, MOCK_TODAY) : null;
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
      (item) => item.challengeId === challengeId && item.date === MOCK_TODAY,
    ) ?? null
  );
}

export function getPreviousCompletions(world: MockWorld): CompletedChallenge[] {
  return world.statements
    .filter((item) => item.date !== MOCK_TODAY)
    .map((item) => {
      const challenge = world.challenges.find(
        (entry) => entry.id === item.challengeId,
      );
      if (!challenge) {
        return null;
      }
      return { challenge, statement: item };
    })
    .filter((item): item is CompletedChallenge => item !== null)
    .sort((a, b) => (a.challenge.date < b.challenge.date ? 1 : -1));
}

export function getHomeState(world: MockWorld): HomeState {
  if (!world.user.selectedThemeId) {
    return 'new';
  }
  const today = getTodaysChallenge(world, world.user.selectedThemeId);
  if (!today || !getTodaysStatement(world, today.id)) {
    return 'challenge_open';
  }
  return 'challenge_complete';
}

export function completeTodaysChallenge(world: MockWorld): MockWorld {
  const themeId = world.user.selectedThemeId;
  const today = getTodaysChallenge(world, themeId);
  const blueprint = getChallengeBlueprint(today?.id);
  if (!themeId || !today || !blueprint || getTodaysStatement(world, today.id)) {
    return world;
  }

  const messages: ChallengeMessage[] = blueprint.turns.flatMap((turn, index) => [
    {
      id: `live-g-${index}`,
      role: 'guide' as const,
      text: turn.guideText,
    },
    {
      id: `live-u-${index}`,
      role: 'user' as const,
      text: turn.userReply,
    },
  ]);

  const nextStatement = statement(world.user.id, today, blueprint.exampleStatement);
  const nextSession = completedSession(
    world.user.id,
    today,
    nextStatement.id,
    messages,
  );
  const hasChallenge = world.challenges.some((item) => item.id === today.id);

  return {
    ...world,
    user: {
      ...world.user,
      currentStreak: world.user.currentStreak + 1,
    },
    challenges: hasChallenge ? world.challenges : [today, ...world.challenges],
    statements: [nextStatement, ...world.statements],
    sessions: [nextSession, ...world.sessions],
  };
}
