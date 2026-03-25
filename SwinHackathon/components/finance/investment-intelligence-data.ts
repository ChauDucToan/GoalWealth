import type {
  BacktestResult,
  NewsImpactAlert,
  PortfolioSnapshot,
  RebalanceRecommendation,
  SuitabilityGuardrail,
  WatchlistAlert,
} from '@/types/product-domain';

export const investmentPortfolioSnapshot: PortfolioSnapshot = {
  totalValue: 0,
  dayChange: 0,
  liquidityLabel: '2 liquid sleeves available',
  riskProfileLabel: 'Moderate Growth',
  freshness: {
    label: 'Portfolio snapshot',
    updatedAt: 'Updated 8 min ago',
    source: 'Holdings, watchlist and market scan',
    status: 'fresh',
  },
  currentAllocation: [
    { label: 'Growth equity', currentWeight: 52, targetWeight: 45, drift: 7 },
    { label: 'Core equity', currentWeight: 26, targetWeight: 30, drift: -4 },
    { label: 'Cash buffer', currentWeight: 12, targetWeight: 15, drift: -3 },
    { label: 'Goal reserve', currentWeight: 10, targetWeight: 10, drift: 0 },
  ],
  goalAllocations: [
    {
      goalId: 'emergency',
      goalTitle: 'Emergency Fund',
      priorityLabel: 'High priority',
      monthlyAllocation: 450,
      currentFunding: 3200,
      targetFunding: 5000,
      riskBand: 'Low risk',
      note: 'Should be fully funded before more aggressive allocations expand.',
    },
    {
      goalId: 'travel',
      goalTitle: 'Vacation',
      priorityLabel: 'Medium priority',
      monthlyAllocation: 320,
      currentFunding: 1480,
      targetFunding: 2400,
      riskBand: 'Low to moderate',
      note: 'On track if current contributions remain unchanged.',
    },
    {
      goalId: 'retirement',
      goalTitle: 'Long-term investing',
      priorityLabel: 'Lower priority',
      monthlyAllocation: 180,
      currentFunding: 860,
      targetFunding: 1800,
      riskBand: 'Moderate growth',
      note: 'Receives the residual allocation after near-term goals are protected.',
    },
  ],
};

export const investmentSuitabilityGuardrail: SuitabilityGuardrail = {
  id: 'inv-suitability',
  title: 'Suitability guardrail is active',
  body: 'Because short-term resilience is not fully funded yet, the advisor should prefer rebalance or hold actions over adding new aggressive exposure.',
  severity: 'warning',
  nextStep: 'Strengthen emergency funding or reduce concentration first.',
};

export const rebalanceRecommendations: RebalanceRecommendation[] = [
  {
    id: 'rebalance-1',
    title: 'Trim part of the overweight growth sleeve',
    summary: 'Current growth exposure exceeds the target allocation by 7 percentage points.',
    whyNow:
      'Earnings concentration and near-term goal deadlines make current volatility less suitable than it was when the position was built.',
    uncertainty:
      'If macro conditions improve quickly, trimming now may under-capture upside. The safer trade-off is better downside resilience.',
    actionPriority: 'High',
    goalImpacts: [
      {
        goalId: 'emergency',
        goalTitle: 'Emergency Fund',
        priorityLabel: 'High priority',
        impact: 'Protects the buffer-building window from a concentrated drawdown.',
        changeLabel: 'Improves suitability immediately',
      },
      {
        goalId: 'travel',
        goalTitle: 'Vacation',
        priorityLabel: 'Medium priority',
        impact: 'Reduces the chance that a short-term market pullback delays goal completion.',
        changeLabel: 'Lower short-term risk',
      },
    ],
    saferAlternative: {
      id: 'alt-hold',
      title: 'Hold positions and only tighten watch thresholds',
      body: 'Lower-friction path if you prefer to avoid changes ahead of earnings.',
      suitability: 'Acceptable but less protective',
      route: '/(finance)/investments',
    },
    guardrail: investmentSuitabilityGuardrail,
  },
  {
    id: 'rebalance-2',
    title: 'Route the next top-up into the cash sleeve',
    summary: 'Cash is slightly under the target weight for the current goal mix.',
    whyNow:
      'A stronger liquidity sleeve improves the plan’s ability to survive unexpected costs without forcing position sales.',
    uncertainty:
      'If no new expenses appear, this can look conservative, but it improves plan durability and future flexibility.',
    actionPriority: 'Medium',
    goalImpacts: [
      {
        goalId: 'emergency',
        goalTitle: 'Emergency Fund',
        priorityLabel: 'High priority',
        impact: 'Accelerates buffer completion and supports safer suitability scoring.',
        changeLabel: '+1 step toward target cash weight',
      },
    ],
  },
];

export const watchlistAlerts: WatchlistAlert[] = [
  {
    id: 'alert-nvda',
    symbol: 'NVDA',
    title: 'Earnings event risk approaching',
    trigger: 'Event alert',
    explanation: 'Upcoming earnings can amplify short-term moves, which matters because the name already carries elevated portfolio weight.',
    suggestedResponse: 'Review',
    severity: 'High',
    updatedAt: 'Updated 12 min ago',
  },
  {
    id: 'alert-aapl',
    symbol: 'AAPL',
    title: 'Price trend still constructive',
    trigger: 'Trend signal',
    explanation: 'No action is required yet, but the advisor is monitoring whether gains increase concentration beyond target range.',
    suggestedResponse: 'Do nothing',
    severity: 'Low',
    updatedAt: 'Updated 15 min ago',
  },
  {
    id: 'alert-msft',
    symbol: 'MSFT',
    title: 'Macro catalyst may justify watch threshold review',
    trigger: 'Macro-linked alert',
    explanation: 'Cloud and AI names could re-rate quickly if rate expectations shift again this week.',
    suggestedResponse: 'Rebalance',
    severity: 'Medium',
    updatedAt: 'Updated 8 min ago',
  },
];

export const strategyBacktest: BacktestResult = {
  horizonLabel: '5-year ruleset evidence',
  cagr: '12.8%',
  volatility: '14.9%',
  maxDrawdown: '-13.4%',
  sharpe: '1.11',
  winRate: '68%',
  turnover: '0.42',
  feeAssumption: '0.15% fees',
  slippageAssumption: '0.10% slippage',
  disclaimer: 'Past performance does not guarantee future results. Backtests are decision support, not promises.',
};

export const investmentNewsImpacts: NewsImpactAlert[] = [
  {
    id: 'news-rates',
    title: 'Rate expectations remain the main swing factor for growth names',
    impactLabel: 'High impact',
    explanation: 'A more dovish outlook supports quality growth, but it also raises the cost of staying over-concentrated ahead of event risk.',
    affectedArea: 'Growth equity sleeve',
    updatedAt: '8 min ago',
    route: '/(tabs)/news-resources',
  },
  {
    id: 'news-energy',
    title: 'Energy volatility may pressure short-term living costs',
    impactLabel: 'Medium impact',
    explanation: 'Higher transport and utility pressure can reduce the free cash available for goal contributions and new investments.',
    affectedArea: 'Cash flow and budgeting',
    updatedAt: '20 min ago',
    route: '/(tabs)/smart-budgeting',
  },
];
