import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { FinancialAssessmentState } from '@/context/financialAssessmentContext';
import type {
  AssessmentResult,
  FinancialProfile,
  OCRExtractionResult,
} from '@/types/product-domain';

export type AssessmentPurposeOption = {
  id: string;
  label: string;
  helper: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

export type AssessmentIncomeSourceOption = {
  id: string;
  label: string;
  helper: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

export type AssessmentPayFrequencyOption = {
  id: string;
  label: string;
  helper: string;
};

export type AssessmentSpendingCategoryOption = {
  id: string;
  label: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

export type AssessmentFinancialGoalOption = {
  id: string;
  label: string;
  helper: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

export type AssessmentTrackingOption = {
  id: string;
  label: string;
  helper: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

export type AssessmentSituationOption = {
  id: string;
  label: string;
  emoji: string;
  helper: string;
};

export type AssessmentEmergencyFundOption = {
  id: string;
  label: string;
  helper: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

export type AssessmentChallengeOption = {
  id: string;
  label: string;
  helper: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

export type AssessmentFlowBlock = {
  id: 'essentials' | 'income' | 'planning' | 'resilience' | 'commitment';
  label: string;
  helper: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  route: string;
  stepCount: number;
};

export type AssessmentOutputHighlight = {
  id: string;
  title: string;
  body: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
};

export const firstChunkSteps = [
  'Your name',
  'App purpose',
  'Occupation',
  'Income source',
  'Monthly income',
  'Savings rate',
] as const;

export const secondChunkSteps = [
  'Pay frequency',
  'Top spending categories',
  'Outstanding debt',
  'Financial goal',
  'Goal deadline',
  'Expense tracking',
] as const;

export const thirdChunkSteps = [
  'Retirement age',
  'Dependents',
  'Current finance situation',
  'Emergency fund',
  'Emergency fund coverage',
  'Spending behaviour',
] as const;

export const fourthChunkSteps = [
  'Biggest challenge',
  'Commitment words',
  'Voice confirmation',
] as const;

export const assessmentFlowBlocks: AssessmentFlowBlock[] = [
  {
    id: 'essentials',
    label: 'Identity & purpose',
    helper: 'Name, work context and the reason you want Finpal to guide you.',
    icon: 'badge',
    route: '/(finance)/financial-assessment/essentials',
    stepCount: 3,
  },
  {
    id: 'income',
    label: 'Income snapshot',
    helper: 'Primary source, monthly income, savings rate and pay cadence.',
    icon: 'payments',
    route: '/(finance)/financial-assessment/income-profile',
    stepCount: 4,
  },
  {
    id: 'planning',
    label: 'Spending & goals',
    helper: 'Pressure categories, debt load, target goal and tracking habits.',
    icon: 'insights',
    route: '/(finance)/financial-assessment/planning',
    stepCount: 5,
  },
  {
    id: 'resilience',
    label: 'Resilience profile',
    helper: 'Retirement, dependents, current situation and emergency buffer.',
    icon: 'shield',
    route: '/(finance)/financial-assessment/resilience',
    stepCount: 6,
  },
  {
    id: 'commitment',
    label: 'Challenge & commitment',
    helper: 'Your biggest blocker plus the closing commitment treatment.',
    icon: 'mic',
    route: '/(finance)/financial-assessment/commitment',
    stepCount: 3,
  },
];

export const assessmentPurposeOptions: AssessmentPurposeOption[] = [
  {
    id: 'budgeting',
    label: 'I want to manage my expenses better',
    helper: 'Get cleaner budgets and spending structure.',
    icon: 'wallet',
  },
  {
    id: 'planning',
    label: 'I want to make better financial decisions',
    helper: 'See clearer tradeoffs before spending money.',
    icon: 'insights',
  },
  {
    id: 'tracking',
    label: 'I want to track my transactions and savings',
    helper: 'Stay on top of spending, cashflow and savings pace.',
    icon: 'monitor',
  },
  {
    id: 'learning',
    label: 'I want to learn about money management',
    helper: 'Use the app more like a guided financial coach.',
    icon: 'school',
  },
  {
    id: 'custom',
    label: 'I need a more personalized financial experience',
    helper: 'Start broad now and refine as the app learns you.',
    icon: 'tune',
  },
];

export const incomeSourceOptions: AssessmentIncomeSourceOption[] = [
  {
    id: 'salary',
    label: 'Salary',
    helper: 'Stable monthly pay from an employer.',
    icon: 'badge',
  },
  {
    id: 'business',
    label: 'Business',
    helper: 'Owner income, contracts or company distributions.',
    icon: 'storefront',
  },
  {
    id: 'freelance',
    label: 'Freelance',
    helper: 'Project-based or invoice-driven work.',
    icon: 'work-outline',
  },
  {
    id: 'other',
    label: 'Other',
    helper: 'Family support, investment income or mixed sources.',
    icon: 'category',
  },
];

export const incomePresets = [3200, 5000, 7200, 10000] as const;
export const liquidAssetPresets = [3000, 8000, 15000, 30000] as const;
export const obligationPresets = [800, 1500, 2200, 3200] as const;
export const occupationExamples = ['Designer', 'Engineer', 'Teacher', 'Freelancer'] as const;
export const outstandingDebtPresets = [0, 5000, 12000, 25000] as const;

export const payFrequencyOptions: AssessmentPayFrequencyOption[] = [
  { id: 'weekly', label: 'Weekly', helper: 'Income lands every week.' },
  { id: 'bi-weekly', label: 'Bi-weekly', helper: 'Paid every two weeks.' },
  { id: 'monthly', label: 'Monthly', helper: 'One main paycheck per month.' },
  { id: 'irregular', label: 'Irregular', helper: 'Variable timing and amount.' },
];

export const spendingCategoryOptions: AssessmentSpendingCategoryOption[] = [
  { id: 'food', label: 'Food', icon: 'restaurant' },
  { id: 'housing', label: 'Housing', icon: 'home-work' },
  { id: 'transport', label: 'Transport', icon: 'directions-car' },
  { id: 'shopping', label: 'Shopping', icon: 'shopping-bag' },
  { id: 'health', label: 'Health', icon: 'favorite' },
  { id: 'family', label: 'Family', icon: 'family-restroom' },
  { id: 'travel', label: 'Travel', icon: 'luggage' },
  { id: 'entertainment', label: 'Fun', icon: 'sports-esports' },
];

export const financialGoalOptions: AssessmentFinancialGoalOption[] = [
  {
    id: 'emergency-fund',
    label: 'Build an emergency fund',
    helper: 'Create a safer cash buffer first.',
    icon: 'shield',
  },
  {
    id: 'debt-payoff',
    label: 'Pay off debt faster',
    helper: 'Reduce liabilities with tighter cash planning.',
    icon: 'payments',
  },
  {
    id: 'major-purchase',
    label: 'Save for a major purchase',
    helper: 'Plan toward a car, home or big ticket item.',
    icon: 'shopping-cart-checkout',
  },
  {
    id: 'retirement',
    label: 'Retirement or long-term investing',
    helper: 'Focus on long-horizon financial growth.',
    icon: 'trending-up',
  },
];

export const goalDeadlineOptions = ['May 12 2026', 'Jun 21 2026', 'Aug 24 2026', 'Sep 25 2026'] as const;

export const expenseTrackingOptions: AssessmentTrackingOption[] = [
  {
    id: 'manual',
    label: 'I track everything manually',
    helper: 'I use notes, sheets or manual logs.',
    icon: 'edit-note',
  },
  {
    id: 'partial',
    label: 'I track some expenses',
    helper: 'Only big purchases or recurring bills.',
    icon: 'tune',
  },
  {
    id: 'automatic',
    label: 'Mostly automated',
    helper: 'Bank apps or tools already do most of it.',
    icon: 'auto-awesome',
  },
  {
    id: 'none',
    label: "I don't track yet",
    helper: 'I need the app to help me start from zero.',
    icon: 'playlist-remove',
  },
];

export const retirementAgeOptions = [65, 66, 67, 68, 69] as const;

export const financeSituationOptions: AssessmentSituationOption[] = [
  { id: 'stressed', label: 'I feel stressed', emoji: '😟', helper: 'Money feels tight or unstable.' },
  { id: 'neutral', label: 'I feel somewhat neutral', emoji: '😐', helper: 'Things are manageable but unclear.' },
  { id: 'confident', label: 'I feel somewhat confident', emoji: '🙂', helper: 'My situation is mostly under control.' },
];

export const emergencyFundOptions: AssessmentEmergencyFundOption[] = [
  {
    id: 'yes',
    label: 'Yes, I have an emergency fund',
    helper: 'There is already a separate cash buffer.',
    icon: 'savings',
  },
  {
    id: 'no',
    label: 'No, not yet',
    helper: 'I still need to build my emergency buffer.',
    icon: 'priority-high',
  },
];

export const spendingBehaviourScale = [
  { score: 1, label: 'Very aggressive spender' },
  { score: 2, label: 'Somewhat impulsive' },
  { score: 3, label: 'Balanced' },
  { score: 4, label: 'Mostly careful' },
  { score: 5, label: 'Very disciplined spender' },
] as const;

export const biggestChallengeOptions: AssessmentChallengeOption[] = [
  {
    id: 'overspending',
    label: 'Overspending habits',
    helper: 'Impulse purchases and poor spending control.',
    icon: 'trending-down',
  },
  {
    id: 'debt',
    label: 'Debt pressure',
    helper: 'Loans or credit balances are slowing progress.',
    icon: 'account-balance',
  },
  {
    id: 'saving',
    label: 'Saving consistently',
    helper: 'It is hard to preserve money month to month.',
    icon: 'savings',
  },
  {
    id: 'planning',
    label: 'Lack of a clear plan',
    helper: 'Goals exist, but actions are scattered.',
    icon: 'alt-route',
  },
] as const;

export const commitmentWaveform = [18, 10, 26, 16, 34, 20, 40, 22, 14, 28, 18, 36, 20, 12, 24, 16] as const;

export const assessmentOutputHighlights: AssessmentOutputHighlight[] = [
  {
    id: 'risk',
    title: 'Dynamic risk profile',
    body: 'Tolerance, financial capacity and behaviour are combined before recommendations are surfaced.',
    icon: 'verified-user',
  },
  {
    id: 'goals',
    title: 'Goal-readiness output',
    body: 'Assessment answers directly influence funding order, feasibility and portfolio suitability.',
    icon: 'flag',
  },
  {
    id: 'ocr',
    title: 'OCR-ready intake',
    body: 'Imported receipts or statements can reduce uncertainty around obligations and cash flow.',
    icon: 'document-scanner',
  },
];

function buildOcrResult(state: FinancialAssessmentState): OCRExtractionResult {
  if (state.ocrImportStatus === 'ready') {
    return {
      status: 'ready',
      title: 'OCR intake already synced',
      fieldsDetected: 12,
      body: 'Latest statement review has already been accepted and reflected in the assessment model.',
    };
  }

  if (state.ocrImportStatus === 'review-needed') {
    return {
      status: 'review-needed',
      title: 'OCR review available',
      fieldsDetected: 12,
      body: 'A recent receipt or statement is waiting for review before cash-flow assumptions are refreshed.',
    };
  }

  return {
    status: 'not-started',
    title: 'No OCR intake yet',
    fieldsDetected: 0,
    body: 'Importing receipts or statements would reduce uncertainty around recurring obligations.',
  };
}

export function buildFinancialProfile(state: FinancialAssessmentState): FinancialProfile {
  return {
    monthlyIncome: state.monthlyIncome,
    savingsRate: state.savingsRate,
    outstandingDebt: state.outstandingDebt,
    liquidAssets: state.liquidAssets,
    monthlyObligations: state.monthlyObligations,
    emergencyFundMonths: state.emergencyFundMonths,
    dependents: state.dependentCount,
  };
}

export function buildAssessmentResult(state: FinancialAssessmentState): AssessmentResult {
  const profile = buildFinancialProfile(state);
  const monthlySaved = Math.round((profile.monthlyIncome * profile.savingsRate) / 100);
  const monthlyFreeCashEstimate = Math.max(monthlySaved - profile.monthlyObligations / 4, 0);
  const debtPressureRatio =
    profile.monthlyIncome > 0 ? profile.outstandingDebt / profile.monthlyIncome : 0;
  const liquidityMonths =
    profile.monthlyObligations > 0
      ? Math.round((profile.liquidAssets / profile.monthlyObligations) * 10) / 10
      : profile.emergencyFundMonths;
  const behaviourScore = state.spendingBehaviourScore ?? 3;
  const readinessScore = Math.max(
    0,
    Math.min(
      100,
      40 +
        profile.savingsRate * 1.2 +
        Math.min(profile.emergencyFundMonths, 6) * 5 -
        Math.min(debtPressureRatio * 6, 22) -
        Math.max(0, 3 - behaviourScore) * 6
    )
  );

  const riskLabel =
    profile.emergencyFundMonths >= 6 && behaviourScore >= 4
      ? 'Moderate Growth'
      : profile.emergencyFundMonths >= 3
        ? 'Balanced'
        : 'Capital Preservation';
  const suitabilityStatus =
    profile.emergencyFundMonths >= 3 && debtPressureRatio < 2.2
      ? 'clear'
      : profile.emergencyFundMonths >= 2
        ? 'caution'
        : 'blocked';

  return {
    profile,
    riskTolerance: {
      label: riskLabel,
      body:
        riskLabel === 'Moderate Growth'
          ? 'You can likely tolerate measured growth exposure, but only if near-term goals stay protected.'
          : riskLabel === 'Balanced'
            ? 'Current answers support a balanced stance with careful control around short-term cash needs.'
            : 'Current resilience suggests defensive recommendations should dominate until the buffer improves.',
    },
    financialCapacity: {
      label: monthlyFreeCashEstimate > 500 ? 'Some room to allocate monthly cash' : 'Cash flow is still tight',
      monthlyFreeCashEstimate,
      liquidityMonths,
      debtPressureLabel:
        debtPressureRatio > 2.5 ? 'Debt pressure elevated' : debtPressureRatio > 1 ? 'Debt pressure manageable' : 'Debt pressure light',
    },
    behavioralSignals: {
      label: behaviourScore >= 4 ? 'Behaviour supports plan adherence' : 'Behaviour still needs support',
      body:
        behaviourScore >= 4
          ? 'Your self-reported behaviour should support automated nudges and recurring transfers.'
          : 'The advisor should lean toward guardrails, reminders and smaller next steps rather than aggressive changes.',
    },
    goalReadiness: {
      readinessLabel:
        readinessScore >= 75
          ? 'Planner is ready to allocate'
          : readinessScore >= 55
            ? 'Planner is usable with caution'
            : 'Planner needs safer defaults first',
      body:
        readinessScore >= 75
          ? 'Current cash flow and resilience can support a meaningful goal plan.'
          : readinessScore >= 55
            ? 'A goal plan is possible, but near-term safety constraints should stay visible.'
            : 'Protecting liquidity and reducing pressure should come before aggressive goal expansion.',
      readinessScore,
    },
    suitability: {
      status: suitabilityStatus,
      title:
        suitabilityStatus === 'clear'
          ? 'Suitability check passed'
          : suitabilityStatus === 'caution'
            ? 'Suitability requires caution'
            : 'Suitability blocks aggressive advice',
      body:
        suitabilityStatus === 'clear'
          ? 'The current profile supports goal planning and measured investment suggestions.'
          : suitabilityStatus === 'caution'
            ? 'Advice should remain conservative until resilience or debt pressure improves.'
            : 'Do not surface aggressive allocation or leverage-style suggestions until the safety buffer improves.',
    },
    ocr: buildOcrResult(state),
    nextActions: [
      {
        id: 'assessment-goals',
        label: 'Open multi-goal planner',
        body: 'Use this assessment to re-check funding order and trade-offs.',
        route: '/(finance)/financial-goals',
        status: 'next',
      },
      {
        id: 'assessment-investments',
        label: 'Review portfolio suitability',
        body: 'See how the current profile changes rebalancing recommendations.',
        route: '/(finance)/investments',
        status: 'review',
      },
      {
        id: 'assessment-ocr',
        label: 'Add spending inputs',
        body: 'Use receipt import or manual entry to improve cash-flow accuracy.',
        route: '/(finance)/smart-budgeting/add-spending',
        status: 'monitor',
      },
    ],
  };
}
