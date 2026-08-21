import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  completeTodaysChallenge,
  createMockWorld,
  type MockWorld,
  type PersonaId,
} from '@/data/mock';

type MockSessionValue = {
  isSignedIn: boolean;
  world: MockWorld | null;
  signIn: (personaId?: PersonaId) => void;
  signUp: () => void;
  signOut: () => void;
  previewPersona: (personaId: PersonaId) => void;
  selectTheme: (themeId: string) => void;
  completeToday: () => void;
};

const MockSessionContext = createContext<MockSessionValue | null>(null);

export function MockSessionProvider({ children }: { children: ReactNode }) {
  const [world, setWorld] = useState<MockWorld | null>(null);

  const signIn = useCallback((personaId: PersonaId = 'new') => {
    setWorld(createMockWorld(personaId));
  }, []);

  const signUp = useCallback(() => {
    setWorld(createMockWorld('new'));
  }, []);

  const signOut = useCallback(() => {
    setWorld(null);
  }, []);

  const previewPersona = useCallback((personaId: PersonaId) => {
    setWorld(createMockWorld(personaId));
  }, []);

  const selectTheme = useCallback((themeId: string) => {
    setWorld((current) => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        user: {
          ...current.user,
          selectedThemeId: themeId,
        },
      };
    });
  }, []);

  const completeToday = useCallback(() => {
    setWorld((current) => (current ? completeTodaysChallenge(current) : current));
  }, []);

  const value = useMemo<MockSessionValue>(
    () => ({
      isSignedIn: world !== null,
      world,
      signIn,
      signUp,
      signOut,
      previewPersona,
      selectTheme,
      completeToday,
    }),
    [world, signIn, signUp, signOut, previewPersona, selectTheme, completeToday],
  );

  return (
    <MockSessionContext.Provider value={value}>
      {children}
    </MockSessionContext.Provider>
  );
}

export function useMockSession(): MockSessionValue {
  const value = useContext(MockSessionContext);
  if (!value) {
    throw new Error('useMockSession must be used within MockSessionProvider.');
  }
  return value;
}
