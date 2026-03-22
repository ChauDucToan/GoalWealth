import { SmartBudgetingContext } from '@/context/smartBudgetingContext';
import { useContext } from 'react';

export function useSmartBudgeting() {
  const context = useContext(SmartBudgetingContext);

  if (!context) {
    throw new Error('useSmartBudgeting must be used within SmartBudgetingProvider');
  }

  return context;
}
