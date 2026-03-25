import { AssistantContext } from '@/context/assistantContext';
import { useContext } from 'react';

export function useAssistant() {
  const context = useContext(AssistantContext);

  if (!context) {
    throw new Error('useAssistant must be used within AssistantProvider');
  }

  return context;
}
