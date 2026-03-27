import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import type { GoalPlanningItem, GoalPriority } from '@/types/product-domain';

export type GoalIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export type FinancialGoalAccount = {
  id: string;
  label: string;
  subtitle: string;
  balance: number;
  mask: string;
  accent: string;
};

export type FinancialGoalHistoryPoint = {
  id: string;
  label: string;
  amount: number;
};

export type FinancialGoalTransfer = {
  id: string;
  label: string;
  date: string;
  amount: number;
  status: 'Completed' | 'Scheduled';
  type: 'Top up' | 'Recurring transfer' | 'Adjustment';
};

export type FinancialGoalItem = GoalPlanningItem & {
  id: string;
  title: string;
  category: string;
  saved: number;
  target: number;
  dueLabel: string;
  icon: GoalIconName;
  accent: string;
  monthlyContribution: number;
  note: string;
  milestones: string[];
  accountId: string;
  accountLabel: string;
  recurringLabel: string;
  targetDate: string;
  targetMonth: string;
  history: FinancialGoalHistoryPoint[];
  transfers: FinancialGoalTransfer[];
};

export type GoalTemplate = {
  id: string;
  label: string;
  icon: GoalIconName;
  helper: string;
  accent: string;
};

export type GoalInsight = {
  id: string;
  title: string;
  body: string;
  value: string;
  tone: 'primaryDark' | 'success' | 'warning';
};

export type GoalPriorityOption = {
  id: GoalPriority;
  label: string;
  body: string;
};

export type GoalRiskOption = {
  id: string;
  label: string;
  body: string;
};

export type GoalIntroHighlight = {
  id: string;
  title: string;
  body: string;
  icon: GoalIconName;
  accent: string;
};

export const financialGoalAccounts: FinancialGoalAccount[] = [
  {
    id: 'savings-plus',
    label: 'Savings Account',
    subtitle: 'High-yield reserve',
    balance: 12540.22,
    mask: '•• 2841',
    accent: '#1A73E8',
  },
  {
    id: 'goal-wallet',
    label: 'Goal Wallet',
    subtitle: 'Finpal dedicated pocket',
    balance: 4680.9,
    mask: '•• 0488',
    accent: '#6A927A',
  },
  {
    id: 'travel-fund',
    label: 'Travel Fund',
    subtitle: 'Weekend + vacation pool',
    balance: 2310.4,
    mask: '•• 6621',
    accent: '#B2955A',
  },
];

export const financialGoals: FinancialGoalItem[] = [
  {
    id: 'travel',
    goalId: 'travel',
    goalType: 'travel',
    goalTitle: 'Vacation',
    title: 'Vacation',
    category: 'Lifestyle',
    saved: 1480,
    target: 2400,
    targetAmount: 2400,
    targetDate: 'September 2026',
    dueLabel: '84 days left',
    icon: 'flight-takeoff',
    accent: '#1A73E8',
    monthlyContribution: 320,
    priority: 'Medium',
    priorityOrder: 2,
    minimumFundingNeed: 280,
    allowedRisk: 'Low to moderate',
    currentProgress: 1480 / 2400,
    feasibilityProbability: 0.84,
    fundingGap: 920,
    constraintFlags: ['Deadline sensitive'],
    conflictWithOtherGoals: ['Emergency Fund'],
    recommendedSequence: 2,
    recommendedMonthlyAllocation: 320,
    note: 'Paris flights and first week accommodation are covered once this goal crosses the next milestone.',
    milestones: ['Book flights', 'Reserve hotel', 'Set aside food and local transport buffer'],
    accountId: 'travel-fund',
    accountLabel: 'Travel Fund',
    recurringLabel: 'Monthly transfer · 5th of each month',
    targetMonth: 'Sep',
    history: [
      { id: 'travel-h1', label: 'Jan', amount: 420 },
      { id: 'travel-h2', label: 'Feb', amount: 620 },
      { id: 'travel-h3', label: 'Mar', amount: 860 },
      { id: 'travel-h4', label: 'Apr', amount: 1120 },
      { id: 'travel-h5', label: 'May', amount: 1330 },
      { id: 'travel-h6', label: 'Jun', amount: 1480 },
    ],
    transfers: [
      {
        id: 'travel-t1',
        label: 'Monthly transfer',
        date: 'Today',
        amount: 320,
        status: 'Completed',
        type: 'Recurring transfer',
      },
      {
        id: 'travel-t2',
        label: 'Top up from salary',
        date: 'May 24',
        amount: 180,
        status: 'Completed',
        type: 'Top up',
      },
      {
        id: 'travel-t3',
        label: 'Monthly transfer',
        date: 'Jul 05',
        amount: 320,
        status: 'Scheduled',
        type: 'Recurring transfer',
      },
    ],
  },
  {
    id: 'emergency',
    goalId: 'emergency',
    goalType: 'emergency-fund',
    goalTitle: 'Emergency Fund',
    title: 'Emergency Fund',
    category: 'Safety',
    saved: 3200,
    target: 5000,
    targetAmount: 5000,
    targetDate: 'January 2027',
    dueLabel: 'Build to 6 months',
    icon: 'health-and-safety',
    accent: '#6A927A',
    monthlyContribution: 450,
    priority: 'High',
    priorityOrder: 1,
    minimumFundingNeed: 400,
    allowedRisk: 'Low risk',
    currentProgress: 3200 / 5000,
    feasibilityProbability: 0.91,
    fundingGap: 1800,
    constraintFlags: ['Suitability critical', 'Liquidity anchor'],
    conflictWithOtherGoals: ['Vacation', 'Home Office Upgrade'],
    recommendedSequence: 1,
    recommendedMonthlyAllocation: 450,
    note: 'Primary buffer for job and health uncertainty. Keep it liquid and separate from daily spending.',
    milestones: ['Reach 4 months of expenses', 'Separate emergency wallet', 'Auto-transfer every payday'],
    accountId: 'savings-plus',
    accountLabel: 'Savings Account',
    recurringLabel: 'Bi-weekly transfer · every Friday',
    targetMonth: 'Jan',
    history: [
      { id: 'emergency-h1', label: 'Jan', amount: 1820 },
      { id: 'emergency-h2', label: 'Feb', amount: 2180 },
      { id: 'emergency-h3', label: 'Mar', amount: 2470 },
      { id: 'emergency-h4', label: 'Apr', amount: 2810 },
      { id: 'emergency-h5', label: 'May', amount: 3040 },
      { id: 'emergency-h6', label: 'Jun', amount: 3200 },
    ],
    transfers: [
      {
        id: 'emergency-t1',
        label: 'Payday reserve transfer',
        date: 'Jun 14',
        amount: 450,
        status: 'Completed',
        type: 'Recurring transfer',
      },
      {
        id: 'emergency-t2',
        label: 'Bonus allocation',
        date: 'May 30',
        amount: 250,
        status: 'Completed',
        type: 'Top up',
      },
      {
        id: 'emergency-t3',
        label: 'Payday reserve transfer',
        date: 'Jun 28',
        amount: 450,
        status: 'Scheduled',
        type: 'Recurring transfer',
      },
    ],
  },
  {
    id: 'home-office',
    goalId: 'home-office',
    goalType: 'workspace-upgrade',
    goalTitle: 'Home Office Upgrade',
    title: 'Home Office Upgrade',
    category: 'Work',
    saved: 860,
    target: 1800,
    targetAmount: 1800,
    targetDate: 'August 2026',
    dueLabel: 'Target by Aug 2026',
    icon: 'desktop-windows',
    accent: '#B2955A',
    monthlyContribution: 180,
    priority: 'Low',
    priorityOrder: 3,
    minimumFundingNeed: 120,
    allowedRisk: 'Moderate growth',
    currentProgress: 860 / 1800,
    feasibilityProbability: 0.58,
    fundingGap: 940,
    constraintFlags: ['Can be deferred'],
    conflictWithOtherGoals: ['Emergency Fund'],
    recommendedSequence: 3,
    recommendedMonthlyAllocation: 180,
    note: 'Desk, monitor arm and acoustic setup for better focus. This stays flexible if bigger priorities appear.',
    milestones: ['Desk fund complete', 'Display setup', 'Final acoustic treatment'],
    accountId: 'goal-wallet',
    accountLabel: 'Goal Wallet',
    recurringLabel: 'Monthly transfer · 18th of each month',
    targetMonth: 'Aug',
    history: [
      { id: 'office-h1', label: 'Jan', amount: 180 },
      { id: 'office-h2', label: 'Feb', amount: 320 },
      { id: 'office-h3', label: 'Mar', amount: 480 },
      { id: 'office-h4', label: 'Apr', amount: 620 },
      { id: 'office-h5', label: 'May', amount: 760 },
      { id: 'office-h6', label: 'Jun', amount: 860 },
    ],
    transfers: [
      {
        id: 'office-t1',
        label: 'Monthly transfer',
        date: 'Jun 18',
        amount: 180,
        status: 'Completed',
        type: 'Recurring transfer',
      },
      {
        id: 'office-t2',
        label: 'Freelance top up',
        date: 'May 29',
        amount: 120,
        status: 'Completed',
        type: 'Top up',
      },
    ],
  },
];

export const goalTemplates: GoalTemplate[] = [
  {
    id: 'travel',
    label: 'Vacation',
    icon: 'flight',
    helper: 'Trips, flights and family weekends.',
    accent: '#1A73E8',
  },
  {
    id: 'safety',
    label: 'Emergency',
    icon: 'shield',
    helper: 'Safety buffer and rainy-day reserve.',
    accent: '#6A927A',
  },
  {
    id: 'debt',
    label: 'Debt Payoff',
    icon: 'payments',
    helper: 'Focused reduction for cards or loans.',
    accent: '#B98486',
  },
  {
    id: 'home',
    label: 'Home',
    icon: 'chair',
    helper: 'Furniture, home office or renovations.',
    accent: '#B2955A',
  },
];

export const targetPresets = [1500, 3000, 5000, 10000] as const;
export const contributionPresets = [100, 250, 400, 600] as const;
export const transferPresets = [50, 100, 250, 500, 1000] as const;
export const goalFrequencyOptions = ['Weekly', 'Bi-weekly', 'Monthly'] as const;
export const goalDeadlineOptions = ['3 months', '6 months', '9 months', '12 months'] as const;
export const goalPriorityOptions: GoalPriorityOption[] = [
  {
    id: 'High',
    label: 'High priority',
    body: 'Fund this first before more flexible goals receive the remaining monthly cash.',
  },
  {
    id: 'Medium',
    label: 'Medium priority',
    body: 'Fund once higher-priority needs are stable and the plan has spare capacity.',
  },
  {
    id: 'Low',
    label: 'Low priority',
    body: 'Receives residual funding after urgent and safety-critical goals are protected.',
  },
];

export const goalRiskOptions: GoalRiskOption[] = [
  {
    id: 'Low risk',
    label: 'Low risk',
    body: 'Appropriate for short-dated or non-negotiable goals.',
  },
  {
    id: 'Low to moderate',
    label: 'Low to moderate',
    body: 'Allows some market sensitivity while protecting the timeline.',
  },
  {
    id: 'Moderate growth',
    label: 'Moderate growth',
    body: 'Suitable only after higher-priority goals are safely funded.',
  },
];

export const financialGoalInsights: GoalInsight[] = [
  {
    id: 'goal-insight-1',
    title: 'Monthly funding pace',
    body: 'Your current automatic transfers already cover the next vacation milestone without touching the emergency buffer.',
    value: '$950/mo',
    tone: 'primaryDark',
  },
  {
    id: 'goal-insight-2',
    title: 'Fastest growing goal',
    body: 'Emergency Fund has the healthiest cadence and can reach 6 months sooner if bonuses continue.',
    value: '64%',
    tone: 'success',
  },
  {
    id: 'goal-insight-3',
    title: 'Needs attention',
    body: 'Home Office Upgrade may miss its deadline unless the monthly transfer increases slightly.',
    value: '1 goal',
    tone: 'warning',
  },
];

export const financialGoalIntroHighlights: GoalIntroHighlight[] = [
  {
    id: 'goal-intro-track',
    title: 'Track each goal in one place',
    body: 'See progress, balance history and the next move without jumping across separate finance tools.',
    icon: 'pie-chart',
    accent: '#1A73E8',
  },
  {
    id: 'goal-intro-transfer',
    title: 'Set transfers faster',
    body: 'Create or edit a goal and attach the savings account from the same streamlined flow.',
    icon: 'sync-alt',
    accent: '#6A927A',
  },
  {
    id: 'goal-intro-review',
    title: 'Review milestones clearly',
    body: 'Use history and milestone cards to decide whether to top up, slow down or delete a goal.',
    icon: 'flag',
    accent: '#B2955A',
  },
];

function normalizeGoalId(goalId?: string | string[] | null) {
  return Array.isArray(goalId) ? goalId[0] ?? null : goalId ?? null;
}

export function findFinancialGoalById(
  goalId?: string | string[] | null,
  goals: FinancialGoalItem[] = financialGoals
) {
  const normalized = normalizeGoalId(goalId);
  if (!normalized) {
    return null;
  }

  return goals.find((goal) => goal.id === normalized) ?? null;
}

export function getFinancialGoalById(
  goalId?: string | string[] | null,
  goals: FinancialGoalItem[] = financialGoals
) {
  const matchedGoal = findFinancialGoalById(goalId, goals);
  if (matchedGoal) {
    return matchedGoal;
  }

  return goals[0];
}

export function getGoalAccountById(accountId?: string | string[] | null) {
  const normalized = Array.isArray(accountId) ? accountId[0] : accountId;
  if (!normalized) {
    return financialGoalAccounts[0];
  }

  return financialGoalAccounts.find((account) => account.id === normalized) ?? financialGoalAccounts[0];
}

export function sortFinancialGoalsByPriority(goals: FinancialGoalItem[] = financialGoals) {
  return [...goals].sort((left, right) => left.priorityOrder - right.priorityOrder);
}

export function getGoalTransferSummary(goals: FinancialGoalItem[] = financialGoals) {
  const orderedGoals = sortFinancialGoalsByPriority(goals);
  if (!orderedGoals.length) {
    return {
      totalSaved: 0,
      totalTarget: 0,
      monthlyContribution: 0,
      totalLeft: 0,
      activeGoals: 0,
      highPriorityGoals: 0,
      nextPriorityGoal: null,
      averageFeasibility: 0,
    };
  }

  const totalSaved = orderedGoals.reduce((sum, goal) => sum + goal.saved, 0);
  const totalTarget = orderedGoals.reduce((sum, goal) => sum + goal.target, 0);
  const monthlyContribution = orderedGoals.reduce(
    (sum, goal) => sum + goal.monthlyContribution,
    0
  );
  const highPriorityGoals = orderedGoals.filter((goal) => goal.priority === 'High');
  const nextPriorityGoal = orderedGoals[0];
  const averageFeasibility =
    orderedGoals.reduce((sum, goal) => sum + goal.feasibilityProbability, 0) / orderedGoals.length;

  return {
    totalSaved,
    totalTarget,
    monthlyContribution,
    totalLeft: totalTarget - totalSaved,
    activeGoals: orderedGoals.length,
    highPriorityGoals: highPriorityGoals.length,
    nextPriorityGoal,
    averageFeasibility,
  };
}

export function getGoalTimelineRows(
  goalId?: string | string[] | null,
  goals: FinancialGoalItem[] = financialGoals
) {
  return findFinancialGoalById(goalId, goals)?.transfers ?? [];
}

export function getGoalsByPriority(goals: FinancialGoalItem[] = financialGoals) {
  return sortFinancialGoalsByPriority(goals);
}

export function getGoalPrioritySummary(
  goalId?: string | string[] | null,
  goals: FinancialGoalItem[] = financialGoals
) {
  const goal = findFinancialGoalById(goalId, goals) ?? goals[0];
  if (!goal) {
    return {
      goal: null,
      blockers: 'No goal selected',
      conflicts: 'No direct goal conflict right now',
      feasibilityLabel: 'No live goal yet',
      fundingGapLabel: '$0 still needs funding',
    };
  }

  const blockers = goal.constraintFlags.join(' • ');
  const conflicts =
    goal.conflictWithOtherGoals.length > 0
      ? `Conflicts with ${goal.conflictWithOtherGoals.join(', ')}`
      : 'No direct goal conflict right now';

  return {
    goal,
    blockers,
    conflicts,
    feasibilityLabel: `${Math.round(goal.feasibilityProbability * 100)}% feasible`,
    fundingGapLabel: `$${goal.fundingGap.toFixed(0)} still needs funding`,
  };
}
