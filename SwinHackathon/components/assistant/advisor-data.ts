import type {
  AdvisorRecommendation,
  BackgroundJobStatus,
  DataFreshnessMeta,
} from '@/types/product-domain';

export const advisorFreshnessMeta: DataFreshnessMeta = {
  label: 'Data freshness',
  updatedAt: 'Updated 8 min ago',
  source: 'Assessment, planner, OCR review and watchlist',
  status: 'fresh',
};

export const advisorPrimaryRecommendation: AdvisorRecommendation = {
  id: 'advisor-primary',
  title: 'Protect near-term goals before adding risk',
  summary: 'Fund the safety layer first.',
  confidenceLabel: 'Moderate confidence',
  recommendationLabel: 'Next move',
  freshness: advisorFreshnessMeta,
  explainability: {
    whyThisRecommendation: 'Near-term goals and concentration risk matter more than extra upside now.',
    assumptions: [
      'Income stays near the current baseline.',
      'Goal contributions keep running this quarter.',
      'Emergency spending stays within the current buffer.',
    ],
    uncertainty:
      'Confidence drops if income turns irregular or OCR imports show higher fixed costs.',
    whatChangesThisAdvice:
      'This becomes more growth-friendly once emergency cover rises or concentration risk drops.',
    dataInputs: [
      'Financial assessment answers',
      'Active goals and monthly allocations',
      'Portfolio concentration and watchlist events',
      'Latest OCR and subscription review',
    ],
  },
  evidence: [
    {
      id: 'ev-goal',
      title: 'Emergency funding stays on top',
      body: 'Higher-priority goals still need funding first.',
      source: 'Goal planner',
      toolName: 'Priority allocation engine',
    },
    {
      id: 'ev-portfolio',
      title: 'Portfolio drift sits in one growth sleeve',
      body: 'A few holdings are driving too much of current volatility.',
      source: 'Portfolio monitor',
      toolName: 'Allocation drift check',
    },
    {
      id: 'ev-market',
      title: 'Macro catalysts stay elevated this week',
      body: 'Earnings and rate expectations are lifting short-term dispersion risk.',
      source: 'News intelligence',
      toolName: 'High-impact event classifier',
    },
  ],
  goalImpacts: [
    {
      goalId: 'emergency',
      goalTitle: 'Emergency Fund',
      priorityLabel: 'High priority',
      impact: 'Improves resilience before the next rebalance.',
      changeLabel: '+1 month sooner',
    },
    {
      goalId: 'travel',
      goalTitle: 'Vacation',
      priorityLabel: 'Medium priority',
      impact: 'Keeps the trip on track without using safety reserves.',
      changeLabel: 'On track',
    },
  ],
  riskWarnings: [
    {
      id: 'risk-concentration',
      title: 'Growth concentration is still elevated',
      body: 'Adding more to the same sleeve would raise drawdown risk.',
      level: 'high',
    },
    {
      id: 'risk-liquidity',
      title: 'Near-term liquidity matters more than upside right now',
      body: 'Short-dated goals make aggressive changes less suitable for now.',
      level: 'moderate',
    },
  ],
  alternatives: [
    {
      id: 'alt-safe',
      title: 'Redirect one top-up to emergency',
      body: 'Improve resilience first, then add risk.',
      suitability: 'Best for current profile',
      route: '/(finance)/financial-goals',
    },
    {
      id: 'alt-monitor',
      title: 'Hold and tighten alert thresholds',
      body: 'Hold exposure and react only if catalysts break the thesis.',
      suitability: 'Lower-friction alternative',
      route: '/(finance)/investments',
    },
  ],
  actions: [
    {
      id: 'act-goals',
      label: 'Review goal order',
      body: 'Confirm the safety goal still comes first.',
      route: '/(finance)/financial-goals',
      status: 'next',
    },
    {
      id: 'act-rebalance',
      label: 'Open rebalance',
      body: 'Review drift and decide whether to trim or just monitor.',
      route: '/(finance)/investments',
      status: 'review',
    },
    {
      id: 'act-ocr',
      label: 'Import receipts',
      body: 'Refresh inputs before the next recommendation cycle.',
      route: '/(assistant)/receipt-upload',
      status: 'monitor',
    },
  ],
  guardrails: [
    {
      id: 'guard-auto-trade',
      title: 'No automatic trade execution',
      body: 'GoalWealth gives decision support only. Rebalances still need user review.',
      severity: 'info',
    },
    {
      id: 'guard-suitability',
      title: 'Higher risk is not suitable yet',
      body: 'Current emergency coverage does not support a higher-risk shift yet.',
      severity: 'warning',
      nextStep: 'Build the buffer first or reduce concentration.',
    },
  ],
};

export const advisorBackgroundJobs: BackgroundJobStatus[] = [
  {
    id: 'job-backtest',
    title: 'Backtest: quality-growth rule',
    type: 'backtest',
    status: 'running',
    detail: '5-year run with fees and slippage.',
    etaLabel: 'ETA 2 min',
    updatedAt: 'Started 1 min ago',
  },
  {
    id: 'job-ocr',
    title: 'OCR review: grocery statement',
    type: 'ocr',
    status: 'review',
    detail: '12 fields need confirmation.',
    updatedAt: 'Needs review now',
  },
  {
    id: 'job-news',
    title: 'Market intelligence sweep',
    type: 'monitoring',
    status: 'completed',
    detail: 'High-impact events were rescored for current holdings.',
    updatedAt: 'Completed 8 min ago',
  },
];
