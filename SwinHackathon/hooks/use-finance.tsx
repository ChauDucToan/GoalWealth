import { FinanceContext } from '@/context/financeContext';
import { useContext } from 'react';

export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }

  return context;
}
