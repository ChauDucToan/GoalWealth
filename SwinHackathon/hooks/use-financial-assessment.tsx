import { FinancialAssessmentContext } from '@/context/financialAssessmentContext';
import { useContext } from 'react';

export function useFinancialAssessment() {
  const context = useContext(FinancialAssessmentContext);

  if (!context) {
    throw new Error('useFinancialAssessment must be used within FinancialAssessmentProvider');
  }

  return context;
}
