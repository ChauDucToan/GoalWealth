import MaterialIcons from '@expo/vector-icons/MaterialIcons';

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
    icon: 'monitoring',
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
