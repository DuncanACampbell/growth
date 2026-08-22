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

export type PersonaId = 'new' | 'incomplete' | 'complete';

export const MOCK_TODAY: IsoDate = '2026-08-21';

export const MOCK_THEMES: Theme[] = [
  {
    id: 'theme-presence',
    name: 'Self Confidence',
    description: '30 daily challenges to help you reframe who you are and why you should love yourself.',
  },
  {
    id: 'theme-courage',
    name: 'Motivation',
    description: 'Feel a surge of energy for achieving your goals after doing our 30-day plan.',
  },
  {
    id: 'theme-discipline',
    name: 'Body confidence',
    description: 'Looking in the mirror gets a lot easier with our plan for reinforcing your positive body beliefs',
  },
];

export type ChallengeTurn = {
  guideText: string;
  userReply: string;
};

/** Hard-coded guided exercise. The real LLM will replace this later. */
export const MOCK_CHALLENGE_TURNS: ChallengeTurn[] = [
  {
    guideText: 'What is one thing you avoided today?',
    userReply: 'I delayed a conversation I know I need to have.',
  },
  {
    guideText: 'If you did the smallest honest version of that, what would you do?',
    userReply: 'Send a short message that names the thing directly.',
  },
];

export const MOCK_STATEMENT_TEXT =
  'I send the short honest message instead of waiting.';

export type MockWorld = {
  personaId: PersonaId;
  user: User;
  themes: Theme[];
  challenges: Challenge[];
  sessions: ChallengeSession[];
  statements: StatementOfTheDay[];
};

const TODAY_CHALLENGES: Challenge[] = MOCK_THEMES.map((theme) => ({
  id: `challenge-today-${theme.id}`,
  themeId: theme.id,
  date: MOCK_TODAY,
  title: 'One honest action',
}));

function previousChallenges(themeId: string): Challenge[] {
  return [
    {
      id: `challenge-${themeId}-2026-08-20`,
      themeId,
      date: '2026-08-20',
      title: 'Name the resistance',
    },
    {
      id: `challenge-${themeId}-2026-08-19`,
      themeId,
      date: '2026-08-19',
      title: 'Keep a small promise',
    },
  ];
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

function pastMessages(prefix: string): ChallengeMessage[] {
  return [
    {
      id: `${prefix}-g1`,
      role: 'guide',
      text: MOCK_CHALLENGE_TURNS[0]?.guideText ?? '',
    },
    {
      id: `${prefix}-u1`,
      role: 'user',
      text: MOCK_CHALLENGE_TURNS[0]?.userReply ?? '',
    },
    {
      id: `${prefix}-g2`,
      role: 'guide',
      text: MOCK_CHALLENGE_TURNS[1]?.guideText ?? '',
    },
    {
      id: `${prefix}-u2`,
      role: 'user',
      text: MOCK_CHALLENGE_TURNS[1]?.userReply ?? '',
    },
  ];
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
    challenges: TODAY_CHALLENGES,
    sessions: [],
    statements: [],
  };
}

function worldForIncomplete(): MockWorld {
  const themeId = 'theme-courage';
  const user: User = {
    id: 'user-incomplete',
    displayName: 'Jordan',
    currentStreak: 4,
    selectedThemeId: themeId,
  };
  const past = previousChallenges(themeId);
  const statements = [
    statement(user.id, past[0]!, 'I named the hard thing out loud.'),
    statement(user.id, past[1]!, 'I kept the ten-minute promise.'),
  ];

  return {
    personaId: 'incomplete',
    user,
    themes: MOCK_THEMES,
    challenges: [...TODAY_CHALLENGES, ...past],
    sessions: past.map((challenge, index) =>
      completedSession(
        user.id,
        challenge,
        statements[index]!.id,
        pastMessages(`incomplete-${challenge.id}`),
      ),
    ),
    statements,
  };
}

function worldForComplete(): MockWorld {
  const themeId = 'theme-presence';
  const user: User = {
    id: 'user-complete',
    displayName: 'Sam',
    currentStreak: 12,
    selectedThemeId: themeId,
  };
  const today = TODAY_CHALLENGES.find((item) => item.themeId === themeId)!;
  const past = previousChallenges(themeId);
  const todayStatement = statement(user.id, today, MOCK_STATEMENT_TEXT);
  const pastStatements = [
    statement(user.id, past[0]!, 'I stayed with the feeling for one minute.'),
    statement(user.id, past[1]!, 'I put the phone down before answering.'),
  ];
  const statements = [todayStatement, ...pastStatements];

  return {
    personaId: 'complete',
    user,
    themes: MOCK_THEMES,
    challenges: [...TODAY_CHALLENGES, ...past],
    sessions: [
      completedSession(
        user.id,
        today,
        todayStatement.id,
        pastMessages(`complete-${today.id}`),
      ),
      ...past.map((challenge, index) =>
        completedSession(
          user.id,
          challenge,
          pastStatements[index]!.id,
          pastMessages(`complete-${challenge.id}`),
        ),
      ),
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
  return (
    world.challenges.find(
      (challenge) => challenge.themeId === themeId && challenge.date === MOCK_TODAY,
    ) ?? null
  );
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
  if (!themeId || !today || getTodaysStatement(world, today.id)) {
    return world;
  }

  const messages: ChallengeMessage[] = MOCK_CHALLENGE_TURNS.flatMap(
    (turn, index) => [
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
    ],
  );

  const nextStatement = statement(world.user.id, today, MOCK_STATEMENT_TEXT);
  const nextSession = completedSession(
    world.user.id,
    today,
    nextStatement.id,
    messages,
  );

  return {
    ...world,
    user: {
      ...world.user,
      currentStreak: world.user.currentStreak + 1,
    },
    statements: [nextStatement, ...world.statements],
    sessions: [nextSession, ...world.sessions],
  };
}
