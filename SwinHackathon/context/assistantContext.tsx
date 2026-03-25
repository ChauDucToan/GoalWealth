import {
  AssistantMessage,
  AssistantScenario,
  assistantScenarios,
  defaultAssistantScenarioId,
} from '@/components/assistant/mock-data';
import { useMyUser } from '@/context/myUserContext';
import { isGoalwealthLiveAdapterEnabled } from '@/services/api/config';
import { normalizeGoalwealthError } from '@/services/api/errors';
import { respondToGoalwealthChat } from '@/services/api/chat';
import type { GoalwealthChatResponseData } from '@/services/api/types';
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

export type AssistantCustomThread = {
  id: string;
  title: string;
  prompt: string;
  icon: AssistantScenario['icon'];
  messages: AssistantMessage[];
};

export type AssistantThreadRuntime = {
  mode: 'mock' | 'goalwealth-adapter';
  status: 'idle' | 'sending' | 'error';
  sessionId: string | null;
  error: string | null;
  warnings: string[];
  requestId: string | null;
  usedContext: GoalwealthChatResponseData['used_context'] | null;
};

export type ReceiptImportDraft = {
  source: 'camera' | 'gallery' | 'files' | 'demo';
  uri?: string;
  name: string;
  mimeType?: string | null;
  fileSize?: number | null;
  kind: 'image' | 'document' | 'mock';
  ocrRawText?: string;
  ocrStatus?: 'idle' | 'running' | 'success' | 'error';
  ocrError?: string | null;
  ocrProvider?: 'mlkit' | 'manual-review';
  backendOcrRecordId?: string | null;
  backendOcrStatus?:
    | 'idle'
    | 'submitting'
    | 'accepted'
    | 'pending_user_context'
    | 'pending_backend'
    | 'ready'
    | 'error';
  backendOcrError?: string | null;
  backendOcrWarnings?: string[];
  backendOcrRequestId?: string | null;
  backendOcrMessage?: string | null;
};

type AssistantContextValue = {
  activeScenarioId: string;
  conversation: AssistantMessage[];
  assistantSettings: AssistantSettings;
  customThread: AssistantCustomThread | null;
  activeThreadRuntime: AssistantThreadRuntime;
  receiptImportDraft: ReceiptImportDraft | null;
  selectAssistantScenario: (id: string) => void;
  openCustomAssistantThread: (thread: AssistantCustomThread) => void;
  setReceiptImportDraft: (draft: ReceiptImportDraft | null) => void;
  sendAssistantMessage: (text: string) => Promise<void>;
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
    'Finance Community',
  ],
  plan: 'free',
};

const initialScenario =
  assistantScenarios.find((item) => item.id === defaultAssistantScenarioId) ?? assistantScenarios[0];

export const AssistantContext = createContext<AssistantContextValue | null>(null);

function buildConversationFromScenario(scenario: AssistantScenario | undefined) {
  return scenario?.messages ?? [];
}

function getScenarioThreadKey(id: string) {
  return `scenario:${id}`;
}

function getCustomThreadKey(id: string) {
  return `custom:${id}`;
}

function buildDefaultThreadRuntime(liveEnabled: boolean): AssistantThreadRuntime {
  return {
    mode: liveEnabled ? 'goalwealth-adapter' : 'mock',
    status: 'idle',
    sessionId: null,
    error: null,
    warnings: [],
    requestId: null,
    usedContext: null,
  };
}

function buildLocalAssistantReply(liveEnabled: boolean, errorMessage?: string | null) {
  if (liveEnabled && errorMessage) {
    return `GoalWealth live is unavailable right now. ${errorMessage} Retry when the adapter is reachable.`;
  }

  return 'I can help with that. Try one of the assistant prompts above, or open voice / receipt tools for structured actions.';
}

function getAssistantLocaleAndTimezone() {
  try {
    const options = Intl.DateTimeFormat().resolvedOptions();
    return {
      locale: options.locale || 'en-US',
      timezone: options.timeZone || 'UTC',
    };
  } catch {
    return {
      locale: 'en-US',
      timezone: 'UTC',
    };
  }
}

export function AssistantProvider({ children }: { children: React.ReactNode }) {
  const { state: userState } = useMyUser();
  const liveAdapterEnabled = isGoalwealthLiveAdapterEnabled();
  const [activeScenarioId, setActiveScenarioId] = useState(initialScenario?.id ?? 'overview');
  const [customThread, setCustomThread] = useState<AssistantCustomThread | null>(null);
  const [threadMessagesByKey, setThreadMessagesByKey] = useState<Record<string, AssistantMessage[]>>(
    () => ({
      [getScenarioThreadKey(initialScenario?.id ?? defaultAssistantScenarioId)]:
        buildConversationFromScenario(initialScenario),
    })
  );
  const [threadRuntimeByKey, setThreadRuntimeByKey] = useState<Record<string, AssistantThreadRuntime>>(
    () => ({
      [getScenarioThreadKey(initialScenario?.id ?? defaultAssistantScenarioId)]:
        buildDefaultThreadRuntime(liveAdapterEnabled),
    })
  );
  const [receiptImportDraft, setReceiptImportDraftState] = useState<ReceiptImportDraft | null>(null);
  const [assistantSettings, setAssistantSettingsState] = useState(initialSettings);

  const value = useMemo<AssistantContextValue>(() => {
    const getAssistantScenario = (id: string) =>
      assistantScenarios.find((item) => item.id === id);
    const activeThreadKey = customThread
      ? getCustomThreadKey(customThread.id)
      : getScenarioThreadKey(activeScenarioId);
    const activeConversation =
      threadMessagesByKey[activeThreadKey] ??
      (customThread
        ? customThread.messages
        : buildConversationFromScenario(getAssistantScenario(activeScenarioId)));
    const activeThreadRuntime =
      threadRuntimeByKey[activeThreadKey] ?? buildDefaultThreadRuntime(liveAdapterEnabled);

    const selectAssistantScenario = (id: string) => {
      const scenario = getAssistantScenario(id);

      if (!scenario) {
        return;
      }

      const threadKey = getScenarioThreadKey(scenario.id);
      setCustomThread(null);
      setActiveScenarioId(scenario.id);
      setThreadMessagesByKey((current) => ({
        ...current,
        [threadKey]: current[threadKey] ?? buildConversationFromScenario(scenario),
      }));
      setThreadRuntimeByKey((current) => ({
        ...current,
        [threadKey]: current[threadKey] ?? buildDefaultThreadRuntime(liveAdapterEnabled),
      }));
    };

    const openCustomAssistantThread = (thread: AssistantCustomThread) => {
      const threadKey = getCustomThreadKey(thread.id);
      setCustomThread(thread);
      setActiveScenarioId('custom');
      setThreadMessagesByKey((current) => ({
        ...current,
        [threadKey]: thread.messages,
      }));
      setThreadRuntimeByKey((current) => ({
        ...current,
        [threadKey]: current[threadKey] ?? buildDefaultThreadRuntime(liveAdapterEnabled),
      }));
    };

    const setReceiptImportDraft = (draft: ReceiptImportDraft | null) => {
      setReceiptImportDraftState(draft);
    };

    const sendAssistantMessage = async (text: string) => {
      const trimmed = text.trim();

      if (!trimmed) {
        return;
      }

      const userMessage: AssistantMessage = {
        id: `assistant-user-${Date.now()}`,
        role: 'user',
        text: trimmed,
        meta: 'Now',
      };

      setThreadMessagesByKey((current) => ({
        ...current,
        [activeThreadKey]: [...(current[activeThreadKey] ?? activeConversation), userMessage],
      }));
      setThreadRuntimeByKey((current) => ({
        ...current,
        [activeThreadKey]: {
          ...(current[activeThreadKey] ?? buildDefaultThreadRuntime(liveAdapterEnabled)),
          mode: liveAdapterEnabled ? 'goalwealth-adapter' : 'mock',
          status: 'sending',
          error: null,
          warnings: [],
          requestId: null,
        },
      }));

      const { locale, timezone } = getAssistantLocaleAndTimezone();

      if (liveAdapterEnabled && userState.accessToken?.trim()) {
        try {
          const response = await respondToGoalwealthChat(
            {
              message: trimmed,
              session_id:
                (threadRuntimeByKey[activeThreadKey] ?? buildDefaultThreadRuntime(true)).sessionId ??
                undefined,
              locale,
              timezone,
            },
            userState.accessToken
          );

          const replyMessage: AssistantMessage = {
            id: `assistant-reply-${Date.now()}`,
            role: 'assistant',
            text: response.data.reply,
            meta: 'GoalWealth live',
          };

          setThreadMessagesByKey((current) => ({
            ...current,
            [activeThreadKey]: [...(current[activeThreadKey] ?? []), replyMessage],
          }));
          setThreadRuntimeByKey((current) => ({
            ...current,
            [activeThreadKey]: {
              mode: 'goalwealth-adapter',
              status: 'idle',
              sessionId: response.data.session_id,
              error: null,
              warnings: [...new Set([...(response.warnings ?? []), ...(response.data.warnings ?? [])])],
              requestId: response.requestId,
              usedContext: response.data.used_context,
            },
          }));
          return;
        } catch (error) {
          const normalizedError = normalizeGoalwealthError(error);
          const fallbackReply: AssistantMessage = {
            id: `assistant-reply-error-${Date.now()}`,
            role: 'assistant',
            text: buildLocalAssistantReply(true, normalizedError.message),
            meta: 'Fallback',
          };

          setThreadMessagesByKey((current) => ({
            ...current,
            [activeThreadKey]: [...(current[activeThreadKey] ?? []), fallbackReply],
          }));
          setThreadRuntimeByKey((current) => ({
            ...current,
            [activeThreadKey]: {
              mode: 'goalwealth-adapter',
              status: 'error',
              sessionId: current[activeThreadKey]?.sessionId ?? null,
              error: normalizedError.message,
              warnings: normalizedError.warnings,
              requestId: normalizedError.requestId,
              usedContext: current[activeThreadKey]?.usedContext ?? null,
            },
          }));
          return;
        }
      }

      const fallbackReply: AssistantMessage = {
        id: `assistant-reply-${Date.now() + 1}`,
        role: 'assistant',
        text: buildLocalAssistantReply(
          liveAdapterEnabled,
          userState.accessToken?.trim() ? null : 'Sign in again to use live GoalWealth responses.'
        ),
        meta: liveAdapterEnabled ? 'Fallback' : 'Local preview',
      };

      setThreadMessagesByKey((current) => ({
        ...current,
        [activeThreadKey]: [...(current[activeThreadKey] ?? []), fallbackReply],
      }));
      setThreadRuntimeByKey((current) => ({
        ...current,
        [activeThreadKey]: {
          mode: liveAdapterEnabled ? 'goalwealth-adapter' : 'mock',
          status: liveAdapterEnabled && !userState.accessToken?.trim() ? 'error' : 'idle',
          sessionId: current[activeThreadKey]?.sessionId ?? null,
          error:
            liveAdapterEnabled && !userState.accessToken?.trim()
              ? 'Sign in again to use the GoalWealth adapter.'
              : null,
          warnings: [],
          requestId: null,
          usedContext: current[activeThreadKey]?.usedContext ?? null,
        },
      }));
    };

    const setAssistantSettings = (patch: Partial<AssistantSettings>) => {
      setAssistantSettingsState((current) => ({ ...current, ...patch }));
    };

    const resetAssistantMemory = () => {
      setActiveScenarioId(initialScenario?.id ?? defaultAssistantScenarioId);
      setCustomThread(null);
      setThreadMessagesByKey({
        [getScenarioThreadKey(initialScenario?.id ?? defaultAssistantScenarioId)]:
          buildConversationFromScenario(initialScenario),
      });
      setThreadRuntimeByKey({
        [getScenarioThreadKey(initialScenario?.id ?? defaultAssistantScenarioId)]:
          buildDefaultThreadRuntime(liveAdapterEnabled),
      });
      setReceiptImportDraftState(null);
      setAssistantSettingsState((current) => ({
        ...current,
        memoryNotes: '',
        adaptiveMemory: false,
      }));
    };

    return {
      activeScenarioId,
      conversation: activeConversation,
      assistantSettings,
      customThread,
      activeThreadRuntime,
      receiptImportDraft,
      selectAssistantScenario,
      openCustomAssistantThread,
      setReceiptImportDraft,
      sendAssistantMessage,
      setAssistantSettings,
      resetAssistantMemory,
      getAssistantScenario,
    };
  }, [
    activeScenarioId,
    assistantSettings,
    customThread,
    liveAdapterEnabled,
    receiptImportDraft,
    threadMessagesByKey,
    threadRuntimeByKey,
    userState.accessToken,
  ]);

  return <AssistantContext.Provider value={value}>{children}</AssistantContext.Provider>;
}
