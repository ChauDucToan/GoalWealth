import {
  financialGoalAccounts,
  FinancialGoalAccount,
  FinancialGoalHistoryPoint,
  FinancialGoalItem,
  FinancialGoalTransfer,
  GoalIconName,
} from '@/components/financial-goals/data';
import type {
  GoalwealthGoalCreateRequest,
  GoalwealthGoalRecord,
  GoalwealthMemoryGoalType,
} from '@/services/api/types';
import type { GoalPriority } from '@/types/product-domain';

type GoalVisualProfile = {
  category: string;
  icon: GoalIconName;
  accent: string;
  defaultRisk: string;
  defaultAccountId: string;
  defaultNote: string;
};

const GOAL_VISUALS: Record<GoalwealthMemoryGoalType, GoalVisualProfile> = {
  savings_goal: {
    category: 'Savings',
    icon: 'savings',
    accent: '#1A73E8',
    defaultRisk: 'Low to moderate',
    defaultAccountId: 'goal-wallet',
    defaultNote:
      'A flexible savings target that can be funded gradually without increasing daily stress.',
  },
  debt_payoff_goal: {
    category: 'Debt',
    icon: 'payments',
    accent: '#B98486',
    defaultRisk: 'Low risk',
    defaultAccountId: 'savings-plus',
    defaultNote:
      'Debt payoff goals reduce interest pressure first and should stay predictable.',
  },
  investment_goal: {
    category: 'Investing',
    icon: 'show-chart',
    accent: '#6A927A',
    defaultRisk: 'Moderate growth',
    defaultAccountId: 'goal-wallet',
    defaultNote:
      'Investment goals should keep a measured contribution pace and leave room for volatility.',
  },
  retirement_goal: {
    category: 'Retirement',
    icon: 'account-balance',
    accent: '#5E7A6C',
    defaultRisk: 'Low to moderate',
    defaultAccountId: 'savings-plus',
    defaultNote:
      'Retirement goals benefit from consistent contributions and a long planning horizon.',
  },
  emergency_fund_goal: {
    category: 'Safety',
    icon: 'health-and-safety',
    accent: '#6A927A',
    defaultRisk: 'Low risk',
    defaultAccountId: 'savings-plus',
    defaultNote:
      'Emergency funds should stay liquid and ready for sudden expenses or income shocks.',
  },
  wealth_building_goal: {
    category: 'Wealth',
    icon: 'stacked-line-chart',
    accent: '#B2955A',
    defaultRisk: 'Moderate growth',
    defaultAccountId: 'goal-wallet',
    defaultNote:
      'Longer-term wealth goals can tolerate slower pacing as long as the plan stays consistent.',
  },
};

const HISTORY_PROGRESS_STEPS = [0.18, 0.32, 0.48, 0.66, 0.82, 1];

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'short' }).format(date);
}

function formatLongMonth(date: Date) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date);
}

function formatCompactCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

function parseDate(dateValue?: string | null) {
  if (!dateValue) {
    return null;
  }

  const parsed = new Date(dateValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function diffDaysFromNow(targetDate?: string | null) {
  const parsed = parseDate(targetDate);
  if (!parsed) {
    return null;
  }

  return Math.ceil((parsed.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function diffMonthsFromNow(targetDate?: string | null) {
  const diffDays = diffDaysFromNow(targetDate);
  if (diffDays == null) {
    return null;
  }

  return Math.max(1, Math.ceil(diffDays / 30));
}

function parseTaggedValue(description: string | null | undefined, tag: string) {
  if (!description?.trim()) {
    return null;
  }

  const expression = new RegExp(`${tag}:\\s*([^\\.]+)`, 'i');
  const match = description.match(expression);
  return match?.[1]?.trim() || null;
}

function stripTaggedDescription(description: string | null | undefined) {
  if (!description?.trim()) {
    return '';
  }

  return description
    .replace(/Allowed risk:\s*[^.]+\.?/gi, '')
    .replace(/Transfer rhythm:\s*[^.]+\.?/gi, '')
    .replace(/Funding source:\s*[^.]+\.?/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function priorityValueToLabel(priority: number | null | undefined): GoalPriority {
  const normalized = priority ?? 5;
  if (normalized >= 8) {
    return 'High';
  }

  if (normalized >= 5) {
    return 'Medium';
  }

  return 'Low';
}

function priorityValueToOrder(priority: number | null | undefined) {
  const normalized = clamp(priority ?? 5, 1, 10);
  return 11 - normalized;
}

function buildDueLabel(
  status: GoalwealthGoalRecord['status'],
  targetDate: string | null,
  progress: number
) {
  if (status === 'completed' || progress >= 1) {
    return 'Fully funded';
  }

  const diffDays = diffDaysFromNow(targetDate);
  if (diffDays == null) {
    return 'Flexible timeline';
  }

  if (diffDays < 0) {
    return 'Target date needs review';
  }

  if (diffDays <= 31) {
    return `${diffDays} days left`;
  }

  if (diffDays <= 360) {
    return `${Math.ceil(diffDays / 30)} months left`;
  }

  const parsed = parseDate(targetDate);
  return parsed ? `Target by ${formatLongMonth(parsed)}` : 'Flexible timeline';
}

function buildHistoryPoints(savedAmount: number): FinancialGoalHistoryPoint[] {
  const currentMonth = new Date();

  return HISTORY_PROGRESS_STEPS.map((step, index) => {
    const pointDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - (5 - index), 1);
    return {
      id: `goal-history-${pointDate.toISOString()}-${index}`,
      label: formatMonthLabel(pointDate),
      amount: Math.round(savedAmount * step),
    };
  });
}

function buildTransfers(
  goalId: string,
  savedAmount: number,
  monthlyContribution: number,
  recurringLabel: string,
  status: GoalwealthGoalRecord['status']
): FinancialGoalTransfer[] {
  const rows: FinancialGoalTransfer[] = [];

  if (savedAmount > 0) {
    rows.push({
      id: `${goalId}-saved-balance`,
      label: 'Current saved balance',
      date: 'Synced now',
      amount: savedAmount,
      status: 'Completed',
      type: 'Top up',
    });
  }

  if (status === 'active' && monthlyContribution > 0) {
    rows.push({
      id: `${goalId}-planned-contribution`,
      label: recurringLabel,
      date: 'Next cycle',
      amount: monthlyContribution,
      status: 'Scheduled',
      type: 'Recurring transfer',
    });
  }

  if (!rows.length) {
    rows.push({
      id: `${goalId}-planner-review`,
      label: 'Planner review',
      date: 'Pending',
      amount: 0,
      status: 'Scheduled',
      type: 'Adjustment',
    });
  }

  return rows;
}

function buildMilestones(title: string, targetAmount: number, targetDate: string, riskLabel: string) {
  const firstTarget = Math.round(targetAmount * 0.35);
  const secondTarget = Math.round(targetAmount * 0.7);

  return [
    `Reach ${formatCompactCurrency(firstTarget)} for ${title.toLowerCase()}.`,
    `Cross ${formatCompactCurrency(secondTarget)} while staying within ${riskLabel.toLowerCase()}.`,
    `Review the target again by ${targetDate}.`,
  ];
}

function buildFeasibility(progress: number, targetDate: string | null, priority: number | null | undefined) {
  const monthsRemaining = diffMonthsFromNow(targetDate);
  const priorityBoost = (priority ?? 5) >= 8 ? 0.08 : (priority ?? 5) >= 5 ? 0.04 : 0;
  const timingBoost =
    monthsRemaining == null ? 0.03 : monthsRemaining >= 12 ? 0.08 : monthsRemaining >= 6 ? 0.04 : -0.03;

  return clamp(0.46 + progress * 0.34 + priorityBoost + timingBoost, 0.28, 0.98);
}

function buildConstraintFlags(
  goalType: GoalwealthGoalRecord['goal_type'],
  progress: number,
  targetDate: string | null,
  status: GoalwealthGoalRecord['status']
) {
  const flags = new Set<string>();
  const diffDays = diffDaysFromNow(targetDate);

  if (status !== 'active') {
    flags.add(`${status[0].toUpperCase()}${status.slice(1)} goal`);
  }

  if (diffDays != null && diffDays < 0 && progress < 1) {
    flags.add('Target date needs review');
  } else if (diffDays != null && diffDays <= 120 && progress < 0.55) {
    flags.add('Deadline sensitive');
  }

  if (progress < 0.25) {
    flags.add('Funding pace below target');
  }

  if (goalType === 'emergency_fund_goal') {
    flags.add('Liquidity anchor');
  }

  if (goalType === 'debt_payoff_goal') {
    flags.add('Interest pressure');
  }

  if (!flags.size) {
    flags.add('On track');
  }

  return [...flags];
}

function resolveAccount(
  goalType: GoalwealthGoalRecord['goal_type'],
  description: string | null
): FinancialGoalAccount {
  const configured = GOAL_VISUALS[goalType];
  const taggedLabel = parseTaggedValue(description, 'Funding source');
  if (taggedLabel) {
    const matched = financialGoalAccounts.find((account) => account.label === taggedLabel);
    if (matched) {
      return matched;
    }
  }

  return (
    financialGoalAccounts.find((account) => account.id === configured.defaultAccountId) ??
    financialGoalAccounts[0]
  );
}

export function mapGoalwealthGoalRecordToFinancialGoal(
  goal: GoalwealthGoalRecord,
  sequence: number,
  conflictTitles: string[]
): FinancialGoalItem {
  const visuals = GOAL_VISUALS[goal.goal_type];
  const account = resolveAccount(goal.goal_type, goal.description);
  const title = goal.title?.trim() || 'Untitled Goal';
  const savedAmount = Math.max(0, goal.current_progress ?? 0);
  const targetAmount = Math.max(goal.target_amount ?? savedAmount, savedAmount, 1000);
  const currentProgress = targetAmount > 0 ? clamp(savedAmount / targetAmount, 0, 1.2) : 0;
  const monthlyContribution =
    goal.status === 'completed'
      ? 0
      : Math.max(
          50,
          Math.round(
            Math.max(targetAmount - savedAmount, 0) /
              Math.max(diffMonthsFromNow(goal.target_date) ?? 12, 1)
          )
        );
  const allowedRisk = parseTaggedValue(goal.description, 'Allowed risk') || visuals.defaultRisk;
  const recurringLabel =
    parseTaggedValue(goal.description, 'Transfer rhythm') || 'Monthly transfer · planner estimate';
  const targetDate = parseDate(goal.target_date);
  const targetDateLabel = targetDate ? formatLongMonth(targetDate) : 'Flexible target';
  const strippedDescription = stripTaggedDescription(goal.description);
  const note = strippedDescription || visuals.defaultNote;
  const fundingGap = Math.max(targetAmount - savedAmount, 0);
  const feasibilityProbability = buildFeasibility(currentProgress, goal.target_date, goal.priority);

  return {
    id: goal.goal_id,
    goalId: goal.goal_id,
    goalType: goal.goal_type,
    goalTitle: title,
    title,
    category: visuals.category,
    saved: savedAmount,
    target: targetAmount,
    targetAmount,
    targetDate: targetDateLabel,
    dueLabel: buildDueLabel(goal.status, goal.target_date, currentProgress),
    icon: visuals.icon,
    accent: visuals.accent,
    monthlyContribution,
    priority: priorityValueToLabel(goal.priority),
    priorityOrder: sequence,
    minimumFundingNeed: Math.max(50, Math.round(monthlyContribution * 0.8)),
    allowedRisk,
    currentProgress,
    feasibilityProbability,
    fundingGap,
    constraintFlags: buildConstraintFlags(goal.goal_type, currentProgress, goal.target_date, goal.status),
    conflictWithOtherGoals: conflictTitles,
    recommendedSequence: sequence,
    recommendedMonthlyAllocation: monthlyContribution,
    note,
    milestones: buildMilestones(title, targetAmount, targetDateLabel, allowedRisk),
    accountId: account.id,
    accountLabel: account.label,
    recurringLabel,
    targetMonth: targetDate ? formatMonthLabel(targetDate) : 'Flex',
    history: buildHistoryPoints(savedAmount),
    transfers: buildTransfers(goal.goal_id, savedAmount, monthlyContribution, recurringLabel, goal.status),
  };
}

export function mapGoalwealthGoalsToFinancialGoals(goals: GoalwealthGoalRecord[]) {
  const ordered = [...goals].sort((left, right) => {
    const leftOrder = priorityValueToOrder(left.priority);
    const rightOrder = priorityValueToOrder(right.priority);
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return (left.title || '').localeCompare(right.title || '');
  });

  return ordered.map((goal, index) => {
    const conflictTitles = ordered
      .filter((candidate) => candidate.goal_id !== goal.goal_id)
      .slice(0, 2)
      .map((candidate) => candidate.title?.trim() || 'Another goal');

    return mapGoalwealthGoalRecordToFinancialGoal(goal, index + 1, conflictTitles);
  });
}

export function buildLocalGoalwealthGoalRecord(
  payload: GoalwealthGoalCreateRequest,
  seed = Date.now().toString(36)
): GoalwealthGoalRecord {
  const nowIso = new Date().toISOString();

  return {
    goal_id: `local-goal-${seed}`,
    title: payload.title,
    goal_type: payload.goal_type,
    status: payload.status ?? 'active',
    priority: payload.priority ?? 5,
    target_amount: payload.target_amount ?? null,
    current_progress: payload.current_progress ?? 0,
    target_date: payload.target_date ?? null,
    description: payload.description ?? null,
    created_at: nowIso,
    updated_at: nowIso,
  };
}
