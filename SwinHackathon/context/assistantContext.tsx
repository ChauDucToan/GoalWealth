import {
  AssistantMessage,
  AssistantScenario,
  assistantScenarios,
  defaultAssistantScenarioId,
} from '@/components/assistant/mock-data';
import React, { createContext, useMemo, useState } from 'react';

export type AssistantSettings = {
  aiCompanionName: string;
  voiceName: string;
  language: string;
  responseType: 'Natural' | 'Detailed' | 'Short';
  model: 'GPT 3.5' | 'GPT 4.1';
  customInstructions: string;
  memoryNotes: string;
  shareData: boolean;
  adaptiveMemory: boolean;
  privacyMode: boolean;
  suggestInsights: string[];
  plan: 'free' | 'pro';
};

type AssistantContextValue = {
  hasSeenAssistantIntro: boolean;
  activeScenarioId: string;
  conversation: AssistantMessage[];
  assistantSettings: AssistantSettings;
  markAssistantIntroSeen: () => void;
  selectAssistantScenario: (id: string) => void;
  sendAssistantMessage: (text: string) => void;
  setAssistantSettings: (patch: Partial<AssistantSettings>) => void;
  resetAssistantMemory: () => void;
  getAssistantScenario: (id: string) => AssistantScenario | undefined;
};

const initialSettings: AssistantSettings = {
  aiCompanionName: 'Finpal AI',
  voiceName: 'Asian Female (Jiyun)',
  language: 'English (United States)',
  responseType: 'Natural',
  model: 'GPT 3.5',
  customInstructions: 'Keep responses practical, concise and budget-aware.',
  memoryNotes: 'User prefers subscription audits and monthly spending summaries.',
  shareData: false,
  adaptiveMemory: true,
  privacyMode: false,
  suggestInsights: [
    'Spending Recommendations',
    'Budget Insights',
    'Saving Tips & Tricks',
    'News & Resources',
  ],
  plan: 'free',
};

const initialScenario =
  assistantScenarios.find((item) => item.id === defaultAssistantScenarioId) ?? assistantScenarios[0];

export const AssistantContext = createContext<AssistantContextValue | null>(null);

function buildConversationFromScenario(scenario: AssistantScenario | undefined) {
  return scenario?.messages ?? [];
}

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const [hasSeenAssistantIntro, setHasSeenAssistantIntro] = useState(false);
  const [activeScenarioId, setActiveScenarioId] = useState(initialScenario?.id ?? 'overview');
  const [conversation, setConversation] = useState<AssistantMessage[]>(
    buildConversationFromScenario(initialScenario)
  );
  const [assistantSettings, setAssistantSettingsState] = useState(initialSettings);

  const value = useMemo<AssistantContextValue>(() => {
    const getAssistantScenario = (id: string) =>
      assistantScenarios.find((item) => item.id === id);

    const markAssistantIntroSeen = () => {
      setHasSeenAssistantIntro(true);
    };

    const selectAssistantScenario = (id: string) => {
      const scenario = getAssistantScenario(id);

      if (!scenario) {
        return;
      }

      setActiveScenarioId(scenario.id);
      setConversation(buildConversationFromScenario(scenario));
    };

    const sendAssistantMessage = (text: string) => {
      const trimmed = text.trim();

      if (!trimmed) {
        return;
      }

      setConversation((current) => [
        ...current,
        {
          id: `assistant-user-${Date.now()}`,
          role: 'user',
          text: trimmed,
          meta: 'Now',
        },
        {
          id: `assistant-reply-${Date.now() + 1}`,
          role: 'assistant',
          text: 'I can help with that. Try one of the assistant prompts above, or open voice / receipt tools for structured actions.',
          meta: 'Now',
        },
      ]);
    };

    const setAssistantSettings = (patch: Partial<AssistantSettings>) => {
      setAssistantSettingsState((current) => ({ ...current, ...patch }));
    };

    const resetAssistantMemory = () => {
      setConversation(buildConversationFromScenario(initialScenario));
      setActiveScenarioId(initialScenario?.id ?? defaultAssistantScenarioId);
      setAssistantSettingsState((current) => ({
        ...current,
        memoryNotes: '',
        adaptiveMemory: false,
      }));
    };

    return {
      hasSeenAssistantIntro,
      activeScenarioId,
      conversation,
      assistantSettings,
      markAssistantIntroSeen,
      selectAssistantScenario,
      sendAssistantMessage,
      setAssistantSettings,
      resetAssistantMemory,
      getAssistantScenario,
    };
  }, [activeScenarioId, assistantSettings, conversation, hasSeenAssistantIntro]);

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}
