import type {
  Challenge,
  ChallengeSession,
  IsoDate,
  ProgrammeMemoryRecord,
  StatementOfTheDay,
  Theme,
  ThemeStatus,
  User,
} from '@/types/models';
import type { ThemeProgress, UserProgress } from '@/types/progress';
import type { DailySession, Programme } from '@/types/programme';

import { MONEY_PROGRAMME } from '@/data/programmes/money';
import { SELF_ESTEEM_PROGRAMME } from '@/data/programmes/self-esteem';
import { addCalendarDays } from '@/lib/calendar';

export type PersonaId = 'new' | 'incomplete' | 'complete';

export const THEME_DURATION_DAYS = 30;

export const THEME_SINGLE_PRICE_EUR = 3;
export const THEME_BUNDLE_PRICE_EUR = 6;
export const THEME_BUNDLE_CREDIT_COUNT = 2;

const EUR_PRICE = THEME_SINGLE_PRICE_EUR;

function listedTheme(
  id: string,
  name: string,
  subtitle: string,
  status: ThemeStatus,
): Theme {
  return {
    id,
    name,
    subtitle,
    status,
    description: subtitle,
    longDescription: subtitle,
    outcomes: [],
    price: EUR_PRICE,
    currency: 'EUR',
  };
}

export const MOCK_THEMES: Theme[] = [
  {
    id: SELF_ESTEEM_PROGRAMME.themeId,
    name: 'Building Self-Esteem',
    subtitle: 'Building a kinder, more realistic view of yourself',
    status: 'available',
    description:
      'Build a stronger, more balanced relationship with yourself through a short daily conversation.',
    longDescription:
      'Over 7 daily conversations, you’ll explore the beliefs, reactions and habits that shape how you see yourself. Each session helps you understand your experiences, question unhelpful assumptions and practise responding with greater self-respect.',
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
    id: MONEY_PROGRAMME.themeId,
    name: 'Money',
    subtitle: 'Build a calmer, healthier relationship with money.',
    status: 'available',
    description: 'Build a calmer, healthier relationship with money.',
    longDescription: 'Build a calmer, healthier relationship with money.',
    outcomes: [],
    price: EUR_PRICE,
    currency: 'EUR',
  },
  listedTheme('theme-relationships', 'Relationships', 'Becoming a better partner and building healthier relationships', 'available'),
  listedTheme('theme-anxiety', 'Anxiety', 'Understanding triggers, uncertainty, worry and coping patterns', 'available'),
  listedTheme('theme-happiness', 'Happiness', 'Discovering what actually makes your life feel good and meaningful', 'available'),
  listedTheme('theme-purpose', 'Purpose', 'Exploring what matters to you and what you want your life to stand for', 'available'),
  listedTheme('theme-confidence', 'Confidence', 'Becoming more comfortable taking risks, speaking up and being seen', 'available'),
  listedTheme('theme-overthinking', 'Overthinking', 'Recognizing rumination and learning when to stop analyzing', 'available'),
  listedTheme('theme-career', 'Career', 'Understanding ambition, satisfaction, strengths and what you want from work', 'available'),
  listedTheme('theme-body-image', 'Body Image', 'Changing how you think about appearance, attractiveness and your body', 'available'),
  listedTheme('theme-friendships', 'Friendships', 'Creating deeper friendships and understanding what you need socially', 'comingSoon'),
  listedTheme('theme-boundaries', 'Boundaries', 'Learning when to say yes, no, ask for things and protect your needs', 'comingSoon'),
  listedTheme('theme-people-pleasing', 'People-Pleasing', 'Reducing the need for approval and becoming more authentic', 'comingSoon'),
  listedTheme('theme-perfectionism', 'Perfectionism', 'Becoming comfortable with mistakes, imperfection and “good enough”', 'comingSoon'),
  listedTheme('theme-jealousy', 'Jealousy', 'Understanding comparison, insecurity, possessiveness and fear of loss', 'comingSoon'),
  listedTheme('theme-loneliness', 'Loneliness', 'Exploring connection, belonging and how to build a richer social life', 'comingSoon'),
  listedTheme('theme-self-compassion', 'Self-Compassion', 'Changing the way you speak to and treat yourself', 'comingSoon'),
  listedTheme('theme-emotional-resilience', 'Emotional Resilience', 'Handling disappointment, rejection, setbacks and difficult emotions', 'comingSoon'),
  listedTheme('theme-habits-discipline', 'Habits & Discipline', 'Understanding motivation and building routines that actually stick', 'comingSoon'),
  listedTheme('theme-procrastination', 'Procrastination', 'Understanding avoidance and becoming better at starting difficult things', 'comingSoon'),
  listedTheme('theme-communication', 'Communication', 'Expressing needs, handling disagreements and listening better', 'comingSoon'),
  listedTheme('theme-sex-intimacy', 'Sex & Intimacy', 'Understanding desire, vulnerability, attraction and sexual confidence', 'comingSoon'),
  listedTheme('theme-comparison', 'Comparison', 'Breaking the habit of measuring your life against other people’s', 'comingSoon'),
  listedTheme('theme-change', 'Change', 'Becoming more comfortable with uncertainty, transitions and letting go', 'comingSoon'),
  listedTheme('theme-identity', 'Identity', 'Exploring who you are beyond work, relationships and other people’s expectations', 'comingSoon'),
  listedTheme('theme-creativity', 'Creativity', 'Reconnecting with curiosity, play, ideas and self-expression', 'comingSoon'),
  listedTheme('theme-gratitude', 'Gratitude', 'Training yourself to notice what’s already good without ignoring problems', 'comingSoon'),
  listedTheme('theme-courage', 'Courage', 'Identifying the fears that constrain your life and gradually confronting them', 'comingSoon'),
  listedTheme('theme-self-trust', 'Self-Trust', 'Becoming more confident in your own decisions and judgment', 'comingSoon'),
  listedTheme('theme-your-future', 'Your Future', 'Clarifying what you want the next chapter of your life to look like', 'comingSoon'),
];

export function getCatalogTheme(themeId: string | null | undefined): Theme | null {
  if (!themeId) {
    return null;
  }
  return MOCK_THEMES.find((item) => item.id === themeId) ?? null;
}

export function isThemeAvailable(theme: Theme): boolean {
  return theme.status === 'available';
}

export function canPurchaseTheme(themeId: string): boolean {
  const theme = getCatalogTheme(themeId);
  return Boolean(theme && theme.status === 'available');
}

export function getAvailableThemes(): Theme[] {
  return MOCK_THEMES.filter((item) => item.status === 'available');
}

export function getComingSoonThemes(): Theme[] {
  return MOCK_THEMES.filter((item) => item.status === 'comingSoon');
}

export function formatEuroPrice(amount: number): string {
  return `€${amount}`;
}

export function formatThemePrice(theme: Theme): string {
  if (theme.currency === 'EUR') {
    return formatEuroPrice(theme.price);
  }
  return `${theme.price} ${theme.currency}`;
}

export function remainingCreditsLabel(count: number): string {
  if (count === 1) {
    return 'You have 1 remaining credit';
  }
  return `You have ${count} remaining credits`;
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

const PROGRAMMES: Programme[] = [SELF_ESTEEM_PROGRAMME, MONEY_PROGRAMME];

export function getProgrammeForTheme(themeId: string): Programme | null {
  return PROGRAMMES.find((item) => item.themeId === themeId) ?? null;
}

/** Length of this theme's programme. Themes without a programme use the default. */
export function getThemeDurationDays(themeId: string): number {
  return getProgrammeForTheme(themeId)?.durationDays ?? THEME_DURATION_DAYS;
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
  const totalDays = programme.durationDays;
  const label = progressLabel(session.day, totalDays);
  return {
    id: session.id,
    themeId: programme.themeId,
    dayIndex: session.day,
    totalDays,
    title: session.concept,
    prompt: label,
    turns: [
      {
        guideText: session.opening ?? '',
        userReply: '',
      },
    ],
    exampleStatement: '',
  };
}

function placeholderBlueprint(themeId: string, day: number): ChallengeBlueprint {
  const totalDays = getThemeDurationDays(themeId);
  const label = progressLabel(day, totalDays);
  return {
    id: `${themeId}-day-${String(day).padStart(2, '0')}`,
    themeId,
    dayIndex: day,
    totalDays,
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
  const catalogTheme = getCatalogTheme(themeId);
  if (!catalogTheme || catalogTheme.status === 'comingSoon') {
    return [];
  }
  const programme = getProgrammeForTheme(themeId);
  const authored = programme
    ? programme.sessions
        .slice()
        .sort((a, b) => a.day - b.day)
        .map((session) => blueprintFromSession(session, programme))
    : [];

  const byDay = new Map<number, ChallengeBlueprint>();
  const totalDays = getThemeDurationDays(themeId);
  for (const item of authored) {
    byDay.set(item.dayIndex, { ...item, totalDays });
  }

  return Array.from({ length: totalDays }, (_, index) => {
    const day = index + 1;
    return byDay.get(day) ?? placeholderBlueprint(themeId, day);
  });
}

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
  programmeMemories: ProgrammeMemoryRecord[];
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
    programmeMemories: [],
  };
}

export function createMockWorld(personaId: PersonaId, today: IsoDate): MockWorld {
  if (personaId === 'new') {
    return emptyWorld(
      'new',
      today,
      { id: 'user-new', displayName: 'Alex', selectedThemeId: null },
      { currentStreak: 0, themeCredits: 0 },
    );
  }

  if (personaId === 'incomplete') {
    const themeId = SELF_ESTEEM_PROGRAMME.themeId;
    return emptyWorld(
      'incomplete',
      today,
      { id: 'user-incomplete', displayName: 'Jordan', selectedThemeId: themeId },
      { currentStreak: 4, themeCredits: 0 },
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

  const themeId = SELF_ESTEEM_PROGRAMME.themeId;
  const completedDay = 3;
  const blueprint = getBlueprintForThemeDay(themeId, completedDay);
  const world = emptyWorld(
    'complete',
    today,
    { id: 'user-complete', displayName: 'Sam', selectedThemeId: themeId },
    { currentStreak: 12, lastActivityDate: today, themeCredits: 0 },
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
        themeId: challenge.themeId,
        exerciseId: challenge.id,
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
