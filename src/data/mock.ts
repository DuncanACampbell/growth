import type {
  Challenge,
  ChallengeSession,
  IsoDate,
  StatementOfTheDay,
  Theme,
  User,
} from '@/types/models';
import type { ThemeProgress, UserProgress } from '@/types/progress';
import type { DailySession, Programme } from '@/types/programme';

import { SELF_ESTEEM_MOCK_CONVERSATIONS } from '@/data/programmes/self-esteem-mock-conversation';
import { SELF_ESTEEM_PROGRAMME } from '@/data/programmes/self-esteem';
import { addCalendarDays } from '@/lib/calendar';

export type PersonaId = 'new' | 'incomplete' | 'complete';

export const THEME_DURATION_DAYS = 30;

const EUR_PRICE = 3;

export const MOCK_THEMES: Theme[] = [
  {
    id: 'theme-presence',
    name: 'Building Self-Esteem',
    description:
      'Build a stronger, more balanced relationship with yourself through a short daily conversation.',
    longDescription:
      'Over 30 daily conversations, you’ll explore the beliefs, reactions and habits that shape how you see yourself. Each session helps you understand your experiences, question unhelpful assumptions and practise responding with greater self-respect.',
    outcomes: [
      'Recognise patterns that undermine your confidence',
      'Question harsh or automatic beliefs about yourself',
      'Depend less on other people’s approval',
      'Respond to setbacks with greater perspective',
      'Practise acting with more self-respect',
    ],
    price: EUR_PRICE,
    currency: 'EUR',
  },
  {
    id: 'theme-jealousy',
    name: 'Jealousy',
    description:
      'Work with comparison, threat and belonging without collapsing your sense of worth.',
    longDescription:
      'Over 30 daily conversations, you’ll look at the situations that spark jealousy and the stories you tell yourself in those moments. Each session helps you notice comparison, stay connected to what you value, and practise responding without abandoning yourself.',
    outcomes: [
      'Notice the situations that trigger comparison',
      'Separate a real concern from a story about your worth',
      'Stay steadier when someone else seems ahead',
      'Name what you actually want instead of spiralling',
      'Practise returning to yourself after a jealous spike',
    ],
    price: EUR_PRICE,
    currency: 'EUR',
  },
  {
    id: 'theme-work',
    name: 'Confidence at Work',
    description:
      'Speak, contribute and judge your work without using other people as the score.',
    longDescription:
      'Over 30 daily conversations, you’ll explore how you show up at work — speaking, contributing, and measuring yourself. Each session helps you notice old performance habits, question unhelpful standards, and practise taking up space with more steadiness.',
    outcomes: [
      'See where you hold back or over-perform',
      'Question standards that only exist to impress others',
      'Speak up with less second-guessing',
      'Judge your work on effort and honesty, not comparison',
      'Practise contributing without waiting to feel ready',
    ],
    price: EUR_PRICE,
    currency: 'EUR',
  },
  {
    id: 'theme-courage',
    name: 'Motivation',
    description:
      'Reconnect with what matters to you and take the next honest step, one day at a time.',
    longDescription:
      'Over 30 daily conversations, you’ll look at what drains your energy, what you keep postponing, and what still matters. Each session helps you understand resistance, choose a smaller true next step, and practise moving without waiting for a perfect mood.',
    outcomes: [
      'Notice what actually drains or restores your energy',
      'Name the goal underneath delay and self-criticism',
      'Break work into a next step you can do today',
      'Question the story that you have to feel ready first',
      'Practise showing up even when motivation is thin',
    ],
    price: EUR_PRICE,
    currency: 'EUR',
  },
  {
    id: 'theme-discipline',
    name: 'Body confidence',
    description:
      'Build a kinder, more honest relationship with your body through a short daily conversation.',
    longDescription:
      'Over 30 daily conversations, you’ll explore the habits of checking, comparing and criticising your body. Each session helps you understand those reactions, question harsh appearance rules, and practise treating your body with more respect in ordinary moments.',
    outcomes: [
      'Notice body-checking and comparison as they happen',
      'Question harsh rules about how you should look',
      'Separate health or care from self-punishment',
      'Respond to a difficult glance with more perspective',
      'Practise relating to your body as a place you live, not a verdict',
    ],
    price: EUR_PRICE,
    currency: 'EUR',
  },
];

export function getCatalogTheme(themeId: string | null | undefined): Theme | null {
  if (!themeId) {
    return null;
  }
  return MOCK_THEMES.find((item) => item.id === themeId) ?? null;
}

export function formatThemePrice(theme: Theme): string {
  if (theme.currency === 'EUR') {
    return `€${theme.price}`;
  }
  return `${theme.price} ${theme.currency}`;
}

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
  const label = progressLabel(session.day, THEME_DURATION_DAYS);
  return {
    id: session.id,
    themeId: programme.themeId,
    dayIndex: session.day,
    totalDays: THEME_DURATION_DAYS,
    title: label,
    prompt: label,
    turns: mock?.turns ?? [{ guideText: session.opening, userReply: '' }],
    exampleStatement: mock?.exampleStatement ?? '',
  };
}

function placeholderBlueprint(themeId: string, day: number): ChallengeBlueprint {
  const label = progressLabel(day, THEME_DURATION_DAYS);
  return {
    id: `${themeId}-day-${String(day).padStart(2, '0')}`,
    themeId,
    dayIndex: day,
    totalDays: THEME_DURATION_DAYS,
    title: label,
    prompt: label,
    turns: [
      {
        guideText: `This is a placeholder conversation for ${label}. What is one thing on your mind about this theme today?`,
        userReply: 'I showed up and named one honest thing.',
      },
      {
        guideText: 'What would it look like to treat that as enough for today?',
        userReply: 'I can take one small next step without needing to feel finished.',
      },
    ],
    exampleStatement: 'I can show up for this work one day at a time.',
  };
}

function catalogBlueprintsForTheme(themeId: string): ChallengeBlueprint[] {
  const programme = getProgrammeForTheme(themeId);
  const authored = programme
    ? programme.sessions
        .slice()
        .sort((a, b) => a.day - b.day)
        .map((session) => blueprintFromSession(session, programme))
    : MOCK_CHALLENGE_BLUEPRINTS.filter((item) => item.themeId === themeId).sort(
        (a, b) => a.dayIndex - b.dayIndex,
      );

  const byDay = new Map<number, ChallengeBlueprint>();
  for (const item of authored) {
    byDay.set(item.dayIndex, { ...item, totalDays: THEME_DURATION_DAYS });
  }

  return Array.from({ length: THEME_DURATION_DAYS }, (_, index) => {
    const day = index + 1;
    return byDay.get(day) ?? placeholderBlueprint(themeId, day);
  });
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
  today: IsoDate;
  user: User;
  userProgress: UserProgress;
  themeProgress: ThemeProgress[];
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

export function getBlueprintForThemeDay(
  themeId: string,
  day: number,
): ChallengeBlueprint | null {
  return getThemeBlueprints(themeId).find((item) => item.dayIndex === day) ?? null;
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

export function challengeFromBlueprint(
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

function emptyWorld(
  personaId: PersonaId,
  today: IsoDate,
  user: User,
  userProgress: UserProgress,
  themeProgress: ThemeProgress[] = [],
): MockWorld {
  return {
    personaId,
    today,
    user,
    userProgress,
    themeProgress,
    themes: MOCK_THEMES,
    challenges: [],
    sessions: [],
    statements: [],
  };
}

export function createMockWorld(personaId: PersonaId, today: IsoDate): MockWorld {
  if (personaId === 'new') {
    return emptyWorld(
      'new',
      today,
      { id: 'user-new', displayName: 'Alex', selectedThemeId: null },
      { currentStreak: 0 },
    );
  }

  if (personaId === 'incomplete') {
    const themeId = 'theme-courage';
    return emptyWorld(
      'incomplete',
      today,
      { id: 'user-incomplete', displayName: 'Jordan', selectedThemeId: themeId },
      { currentStreak: 4 },
      [
        {
          themeId,
          purchasedAt: today,
          currentDay: 3,
          status: 'active',
          currentSessionStatus: 'waiting',
          currentSessionAvailableAt: today,
        },
      ],
    );
  }

  const themeId = 'theme-presence';
  const completedDay = 3;
  const blueprint = getBlueprintForThemeDay(themeId, completedDay);
  const world = emptyWorld(
    'complete',
    today,
    { id: 'user-complete', displayName: 'Sam', selectedThemeId: themeId },
    { currentStreak: 12, lastActivityDate: today },
    [
      {
        themeId,
        purchasedAt: today,
        currentDay: completedDay + 1,
        status: 'active',
        currentSessionStatus: 'waiting',
        currentSessionAvailableAt: addCalendarDays(today, 1),
        lastCompletedAt: today,
      },
    ],
  );
  if (!blueprint) {
    return world;
  }
  const challenge = challengeFromBlueprint(blueprint, today);
  return {
    ...world,
    challenges: [challenge],
    statements: [
      {
        id: `statement-${world.user.id}-${challenge.id}`,
        userId: world.user.id,
        challengeId: challenge.id,
        date: today,
        text: blueprint.exampleStatement,
      },
    ],
  };
}

export function getTheme(world: MockWorld, themeId: string | null): Theme | null {
  if (!themeId) {
    return null;
  }
  return world.themes.find((theme) => theme.id === themeId) ?? null;
}
