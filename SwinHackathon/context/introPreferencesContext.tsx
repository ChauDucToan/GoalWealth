import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

type IntroPreferenceFlags = {
  hasSeenWelcome: boolean;
  hasSeenAssistantIntro: boolean;
  hasSeenSubscriptionIntro: boolean;
  hasSeenFinancialGoalsIntro: boolean;
  hasSeenCommunityIntro: boolean;
  hasSeenSmartBudgetSetupIntro: boolean;
};

type IntroPreferencesContextValue = IntroPreferenceFlags & {
  isIntroPreferencesReady: boolean;
  markWelcomeSeen: () => void;
  markAssistantIntroSeen: () => void;
  markSubscriptionIntroSeen: () => void;
  markFinancialGoalsIntroSeen: () => void;
  markCommunityIntroSeen: () => void;
  markSmartBudgetSetupIntroSeen: () => void;
};

const INTRO_PREFERENCES_STORAGE_KEY = 'goalwealth:intro-preferences:v1';

const defaultFlags: IntroPreferenceFlags = {
  hasSeenWelcome: false,
  hasSeenAssistantIntro: false,
  hasSeenSubscriptionIntro: false,
  hasSeenFinancialGoalsIntro: false,
  hasSeenCommunityIntro: false,
  hasSeenSmartBudgetSetupIntro: false,
};

const IntroPreferencesContext = createContext<IntroPreferencesContextValue | null>(null);

export function IntroPreferencesProvider({ children }: { children: React.ReactNode }) {
  const [flags, setFlags] = useState<IntroPreferenceFlags>(defaultFlags);
  const [isIntroPreferencesReady, setIsIntroPreferencesReady] = useState(false);

  useEffect(() => {
    let active = true;

    const loadPreferences = async () => {
      try {
        const stored = await AsyncStorage.getItem(INTRO_PREFERENCES_STORAGE_KEY);

        if (!stored || !active) {
          return;
        }

        const parsed = JSON.parse(stored) as Partial<IntroPreferenceFlags>;
        setFlags({ ...defaultFlags, ...parsed });
      } catch {
        if (active) {
          setFlags(defaultFlags);
        }
      } finally {
        if (active) {
          setIsIntroPreferencesReady(true);
        }
      }
    };

    void loadPreferences();

    return () => {
      active = false;
    };
  }, []);

  const persistPreferences = useCallback(async (nextFlags: IntroPreferenceFlags) => {
    try {
      await AsyncStorage.setItem(INTRO_PREFERENCES_STORAGE_KEY, JSON.stringify(nextFlags));
    } catch {
      // Keep the in-memory flags even if persistence fails.
    }
  }, []);

  const markFlagSeen = useCallback(
    (key: keyof IntroPreferenceFlags) => {
      setFlags((current) => {
        if (current[key]) {
          return current;
        }

        const next = { ...current, [key]: true };
        void persistPreferences(next);
        return next;
      });
    },
    [persistPreferences]
  );

  const markWelcomeSeen = useCallback(() => markFlagSeen('hasSeenWelcome'), [markFlagSeen]);
  const markAssistantIntroSeen = useCallback(
    () => markFlagSeen('hasSeenAssistantIntro'),
    [markFlagSeen]
  );
  const markSubscriptionIntroSeen = useCallback(
    () => markFlagSeen('hasSeenSubscriptionIntro'),
    [markFlagSeen]
  );
  const markFinancialGoalsIntroSeen = useCallback(
    () => markFlagSeen('hasSeenFinancialGoalsIntro'),
    [markFlagSeen]
  );
  const markCommunityIntroSeen = useCallback(
    () => markFlagSeen('hasSeenCommunityIntro'),
    [markFlagSeen]
  );
  const markSmartBudgetSetupIntroSeen = useCallback(
    () => markFlagSeen('hasSeenSmartBudgetSetupIntro'),
    [markFlagSeen]
  );

  const value = useMemo<IntroPreferencesContextValue>(
    () => ({
      ...flags,
      isIntroPreferencesReady,
      markWelcomeSeen,
      markAssistantIntroSeen,
      markSubscriptionIntroSeen,
      markFinancialGoalsIntroSeen,
      markCommunityIntroSeen,
      markSmartBudgetSetupIntroSeen,
    }),
    [
      flags,
      isIntroPreferencesReady,
      markAssistantIntroSeen,
      markCommunityIntroSeen,
      markFinancialGoalsIntroSeen,
      markSmartBudgetSetupIntroSeen,
      markSubscriptionIntroSeen,
      markWelcomeSeen,
    ]
  );

  return <IntroPreferencesContext.Provider value={value}>{children}</IntroPreferencesContext.Provider>;
}

export function useIntroPreferences() {
  const context = useContext(IntroPreferencesContext);

  if (!context) {
    throw new Error('useIntroPreferences must be used within IntroPreferencesProvider');
  }

  return context;
}
