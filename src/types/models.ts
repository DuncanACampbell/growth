/** Calendar date as YYYY-MM-DD. */
export type IsoDate = string;

/**
 * The signed-in person. Theme progress and streak live beside the user,
 * not as a single selected-theme pointer.
 */
export type User = {
  id: string;
  displayName: string;
  selectedThemeId: string | null;
};

export type ThemeCurrency = 'EUR';

export type ThemeStatus = 'available' | 'comingSoon';

/**
 * A focus area the user works on — not the UI colour theme.
 * `description` is the short purchase/card summary.
 * `subtitle` is the catalogue line shown under the name.
 * `status` controls whether the theme can be opened or purchased.
 */
export type Theme = {
  id: string;
  name: string;
  subtitle: string;
  status: ThemeStatus;
  description: string;
  longDescription: string;
  outcomes: string[];
  price: number;
  currency: ThemeCurrency;
};

/** One daily exercise, belonging to a theme and a calendar date. */
export type Challenge = {
  id: string;
  themeId: string;
  date: IsoDate;
  title: string;
  prompt: string;
  day: number;
  totalDays: number;
};

export type ChallengeMessageRole = 'guide' | 'user';

export type ChallengeMessage = {
  id: string;
  role: ChallengeMessageRole;
  text: string;
};

export type ChallengeSessionStatus = 'in_progress' | 'completed';

/**
 * Internal notes from a completed conversation. Stored for later days.
 * Not shown in the chat UI.
 */
export type SessionNotes = {
  sessionSummary: string;
  selfEsteemTriggers: string[];
  recurringBeliefs: string[];
  strengths: string[];
  dailyExercise: string;
  tomorrowFocus: string;
  importantMemory: string;
};

/** A user's attempt at a challenge, including the guided exchange. */
export type ChallengeSession = {
  id: string;
  userId: string;
  challengeId: string;
  status: ChallengeSessionStatus;
  messages: ChallengeMessage[];
  statementId: string | null;
  notes: SessionNotes | null;
};

/** The sentence produced when a challenge is completed. */
export type StatementOfTheDay = {
  id: string;
  userId: string;
  challengeId: string;
  themeId: string;
  exerciseId: string;
  date: IsoDate;
  text: string;
};

export type HomeState = 'new' | 'challenge_open' | 'challenge_complete';

export type CompletedChallenge = {
  challenge: Challenge;
  statement: StatementOfTheDay;
};
