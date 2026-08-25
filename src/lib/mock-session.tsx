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
  resetAllProgress,
  resetEntitlements as resetEntitlementsInWorld,
  resetStreak,
  resetTheme,
  selectTheme as selectThemeInWorld,
  setThemeCredits as setThemeCreditsInWorld,
  setThemeDay,
  shiftThemeDay,
  unlockThemeWithBundlePurchase as unlockWithBundleInWorld,
  unlockThemeWithCredit as unlockWithCreditInWorld,
  unlockThemeWithSinglePurchase as unlockWithSingleInWorld,
  type CompleteSessionOptions,
} from '@/data/progression';
import { getLocalIsoDate } from '@/lib/calendar';

const STORAGE_KEY = 'growth.mock-world.v2';

function normalizeWorld(world: MockWorld): MockWorld {
  return {
    ...world,
    userProgress: {
      ...world.userProgress,
      themeCredits: Math.max(0, world.userProgress.themeCredits ?? 0),
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
  previewPersona: (personaId: PersonaId) => void;
  selectTheme: (themeId: string) => void;
  unlockThemeWithSinglePurchase: (themeId: string) => void;
  unlockThemeWithBundlePurchase: (themeId: string) => void;
  unlockThemeWithCredit: (themeId: string) => void;
  setThemeCredits: (count: number) => void;
  resetEntitlements: () => void;
  completeToday: (themeId?: string, options?: CompleteSessionOptions) => void;
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

  const previewPersona = useCallback((personaId: PersonaId) => {
    setWorld(createMockWorld(personaId, getLocalIsoDate()));
  }, []);

  const selectTheme = useCallback((themeId: string) => {
    setWorld((current) => (current ? selectThemeInWorld(current, themeId) : current));
  }, []);

  const unlockThemeWithSinglePurchase = useCallback((themeId: string) => {
    setWorld((current) =>
      current ? unlockWithSingleInWorld(current, themeId) : current,
    );
  }, []);

  const unlockThemeWithBundlePurchase = useCallback((themeId: string) => {
    setWorld((current) =>
      current ? unlockWithBundleInWorld(current, themeId) : current,
    );
  }, []);

  const unlockThemeWithCredit = useCallback((themeId: string) => {
    setWorld((current) =>
      current ? unlockWithCreditInWorld(current, themeId) : current,
    );
  }, []);

  const setThemeCredits = useCallback((count: number) => {
    setWorld((current) => (current ? setThemeCreditsInWorld(current, count) : current));
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
      previewPersona,
      selectTheme,
      unlockThemeWithSinglePurchase,
      unlockThemeWithBundlePurchase,
      unlockThemeWithCredit,
      setThemeCredits,
      resetEntitlements,
      completeToday,
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
      previewPersona,
      selectTheme,
      unlockThemeWithSinglePurchase,
      unlockThemeWithBundlePurchase,
      unlockThemeWithCredit,
      setThemeCredits,
      resetEntitlements,
      completeToday,
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
