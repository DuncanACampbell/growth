import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  createMockWorld,
  MOCK_THEMES,
  type MockWorld,
  type PersonaId,
} from '@/data/mock';
import {
  advanceCalendarDay,
  completeTodaysChallenge,
  loadThreeThemeScenario,
  purchaseTheme as purchaseThemeInWorld,
  resetAllProgress,
  resetEntitlements as resetEntitlementsInWorld,
  resetStreak,
  resetTheme,
  selectTheme as selectThemeInWorld,
  setThemeDay,
  shiftThemeDay,
  upsertInProgressSession,
  type CompleteSessionOptions,
} from '@/data/progression';
import { getLocalIsoDate } from '@/lib/calendar';
import {
  nextOnboardingStepAfterName,
  sanitizeInterestedThemeIds,
} from '@/lib/onboarding';
import type { ChallengeMessage } from '@/types/models';

const STORAGE_KEY = 'growth.mock-world.v2';

function normalizeWorld(world: MockWorld): MockWorld {
  return {
    ...world,
    user: {
      ...world.user,
      // Existing local worlds predate onboarding — treat them as finished.
      onboardingStep: world.user.onboardingStep ?? 'complete',
      displayName: world.user.displayName ?? '',
      interestedThemeIds: Array.isArray(world.user.interestedThemeIds)
        ? world.user.interestedThemeIds
        : [],
    },
    userProgress: {
      currentStreak: world.userProgress.currentStreak,
      lastActivityDate: world.userProgress.lastActivityDate,
    },
    statements: world.statements.map((item) => ({
      ...item,
      themeId:
        item.themeId ||
        world.challenges.find((challenge) => challenge.id === item.challengeId)
          ?.themeId ||
        '',
      exerciseId: item.exerciseId || item.challengeId,
    })),
    programmeMemories: Array.isArray(world.programmeMemories)
      ? world.programmeMemories
      : [],
    sessions: Array.isArray(world.sessions)
      ? world.sessions.map((item) => ({
          ...item,
          themeId:
            item.themeId ||
            world.challenges.find((challenge) => challenge.id === item.challengeId)
              ?.themeId ||
            item.themeId,
          exerciseId: item.exerciseId || item.challengeId,
        }))
      : [],
  };
}

type MockSessionValue = {
  isReady: boolean;
  isSignedIn: boolean;
  world: MockWorld | null;
  catalogThemes: typeof MOCK_THEMES;
  signIn: (personaId?: PersonaId) => void;
  signUp: () => void;
  signOut: () => void;
  /** Saves preferred name and advances onboarding to theme interests. */
  completeOnboardingName: (displayName: string) => void;
  /**
   * Saves interest theme IDs and completes onboarding.
   * Does not unlock, purchase, or start any programme.
   */
  completeOnboardingThemes: (interestedThemeIds: string[]) => void;
  previewPersona: (personaId: PersonaId) => void;
  selectTheme: (themeId: string) => void;
  purchaseTheme: (themeId: string) => void;
  resetEntitlements: () => void;
  completeToday: (themeId?: string, options?: CompleteSessionOptions) => void;
  saveInProgressSession: (input: {
    themeId: string;
    exerciseId: string;
    messages: ChallengeMessage[];
    sessionId?: string;
  }) => void;
  resetProgress: () => void;
  resetThemeProgress: (themeId: string) => void;
  setThemeDayNumber: (themeId: string, day: number) => void;
  simulateNextDay: () => void;
  resetStreakProgress: () => void;
  loadThreeActiveThemes: () => void;
};

const MockSessionContext = createContext<MockSessionValue | null>(null);

export function MockSessionProvider({ children }: { children: ReactNode }) {
  const [world, setWorld] = useState<MockWorld | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (cancelled || !raw) {
          return;
        }
        const parsed = JSON.parse(raw) as MockWorld;
        if (parsed?.user && parsed.today && Array.isArray(parsed.themeProgress)) {
          setWorld(normalizeWorld(parsed));
        }
      })
      .catch(() => {
        // Ignore corrupt prototype storage and start fresh.
      })
      .finally(() => {
        if (!cancelled) {
          setIsReady(true);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isReady) {
      return;
    }
    if (!world) {
      void AsyncStorage.removeItem(STORAGE_KEY);
      return;
    }
    void AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(world));
  }, [isReady, world]);

  const signIn = useCallback((personaId: PersonaId = 'new') => {
    setWorld(createMockWorld(personaId, getLocalIsoDate()));
  }, []);

  const signUp = useCallback(() => {
    setWorld(createMockWorld('new', getLocalIsoDate()));
  }, []);

  const signOut = useCallback(() => {
    setWorld(null);
  }, []);

  const completeOnboardingName = useCallback((rawName: string) => {
    const displayName = rawName.trim();
    if (!displayName) {
      return;
    }
    setWorld((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        user: {
          ...current.user,
          displayName,
          onboardingStep: nextOnboardingStepAfterName(),
        },
      };
    });
  }, []);

  const completeOnboardingThemes = useCallback((themeIds: string[]) => {
    const interestedThemeIds = sanitizeInterestedThemeIds(themeIds);
    if (interestedThemeIds.length === 0) {
      return;
    }
    setWorld((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        user: {
          ...current.user,
          interestedThemeIds,
          onboardingStep: 'complete',
        },
      };
    });
  }, []);

  const previewPersona = useCallback((personaId: PersonaId) => {
    setWorld(createMockWorld(personaId, getLocalIsoDate()));
  }, []);

  const selectTheme = useCallback((themeId: string) => {
    setWorld((current) => (current ? selectThemeInWorld(current, themeId) : current));
  }, []);

  const purchaseTheme = useCallback((themeId: string) => {
    setWorld((current) => (current ? purchaseThemeInWorld(current, themeId) : current));
  }, []);

  const resetEntitlements = useCallback(() => {
    setWorld((current) => (current ? resetEntitlementsInWorld(current) : current));
  }, []);

  const completeToday = useCallback(
    (themeId?: string, options?: CompleteSessionOptions) => {
      setWorld((current) =>
        current ? completeTodaysChallenge(current, themeId, options) : current,
      );
    },
    [],
  );

  const saveInProgressSession = useCallback(
    (input: {
      themeId: string;
      exerciseId: string;
      messages: ChallengeMessage[];
      sessionId?: string;
    }) => {
      setWorld((current) =>
        current ? upsertInProgressSession(current, input) : current,
      );
    },
    [],
  );

  const resetProgress = useCallback(() => {
    setWorld((current) =>
      current ? resetAllProgress(current, getLocalIsoDate()) : current,
    );
  }, []);

  const resetThemeProgress = useCallback((themeId: string) => {
    setWorld((current) => (current ? resetTheme(current, themeId) : current));
  }, []);

  const setThemeDayNumber = useCallback((themeId: string, day: number) => {
    setWorld((current) => {
      if (!current) {
        return current;
      }
      const progress = current.themeProgress.find((item) => item.themeId === themeId);
      if (!progress) {
        return setThemeDay(current, themeId, day);
      }
      return shiftThemeDay(current, themeId, day - progress.currentDay);
    });
  }, []);

  const simulateNextDay = useCallback(() => {
    setWorld((current) => (current ? advanceCalendarDay(current) : current));
  }, []);

  const resetStreakProgress = useCallback(() => {
    setWorld((current) => (current ? resetStreak(current) : current));
  }, []);

  const loadThreeActiveThemes = useCallback(() => {
    setWorld((current) => {
      const base = current ?? createMockWorld('new', getLocalIsoDate());
      return loadThreeThemeScenario(base);
    });
  }, []);

  const value = useMemo<MockSessionValue>(
    () => ({
      isReady,
      isSignedIn: world !== null,
      world,
      catalogThemes: MOCK_THEMES,
      signIn,
      signUp,
      signOut,
      completeOnboardingName,
      completeOnboardingThemes,
      previewPersona,
      selectTheme,
      purchaseTheme,
      resetEntitlements,
      completeToday,
      saveInProgressSession,
      resetProgress,
      resetThemeProgress,
      setThemeDayNumber,
      simulateNextDay,
      resetStreakProgress,
      loadThreeActiveThemes,
    }),
    [
      isReady,
      world,
      signIn,
      signUp,
      signOut,
      completeOnboardingName,
      completeOnboardingThemes,
      previewPersona,
      selectTheme,
      purchaseTheme,
      resetEntitlements,
      completeToday,
      saveInProgressSession,
      resetProgress,
      resetThemeProgress,
      setThemeDayNumber,
      simulateNextDay,
      resetStreakProgress,
      loadThreeActiveThemes,
    ],
  );

  return (
    <MockSessionContext.Provider value={value}>{children}</MockSessionContext.Provider>
  );
}

export function useMockSession(): MockSessionValue {
  const value = useContext(MockSessionContext);
  if (!value) {
    throw new Error('useMockSession must be used within MockSessionProvider.');
  }
  return value;
}
