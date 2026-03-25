import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type ProposalTone = 'primaryDark' | 'success' | 'warning' | 'error' | 'secondary';
export type ProposalIcon = React.ComponentProps<typeof MaterialIcons>['name'];

export type ProposalRoute =
  | '/(tabs)/assistant'
  | '/(finance)/financial-assessment'
  | '/(finance)/financial-goals'
  | '/(finance)/investments'
  | '/(assistant)/receipt-upload'
  | '/(tabs)/news-resources'
  | '/(tabs)/smart-budgeting'
  | '/(tabs)/achievements'
  | '/(finance)/subscriptions'
  | '/(finance)/subscription-stats';

export type ProposalModuleCard = {
  id: string;
  title: string;
  body: string;
  badge: string;
  metric: string;
  icon: ProposalIcon;
  tone: ProposalTone;
  route: ProposalRoute;
};

export type ProposalPriorityItem = {
  id: string;
  title: string;
  detail: string;
  status: string;
  icon: ProposalIcon;
  tone: ProposalTone;
  route: ProposalRoute;
};

export type ProposalJourneyStep = {
  id: string;
  title: string;
  body: string;
  status: string;
  icon: ProposalIcon;
  tone: ProposalTone;
  route: ProposalRoute;
};

export type ProposalExplainabilityPoint = {
  id: string;
  title: string;
  body: string;
  icon: ProposalIcon;
  tone: ProposalTone;
};

export type ProposalNewsSignal = {
  id: string;
  title: string;
  impact: string;
  body: string;
  symbol: string;
  icon: ProposalIcon;
  tone: ProposalTone;
  route: ProposalRoute;
};

export type ProposalBacktestMetric = {
  id: string;
  label: string;
  value: string;
  note: string;
};

export type ProposalRebalanceAction = {
  id: string;
  title: string;
  body: string;
  impact: string;
  icon: ProposalIcon;
  tone: ProposalTone;
};

export const proposalHomeModules: ProposalModuleCard[] = [
  {
    id: 'assessment',
    title: 'Dynamic Assessment',
    body: 'Refresh risk, cash-flow resilience and behaviour signals.',
    badge: 'FR2 risk refresh',
    metric: '21 signals mapped',
    icon: 'fact-check',
    tone: 'primaryDark',
    route: '/(finance)/financial-assessment',
  },
  {
    id: 'goals',
    title: 'Multi-goal Planner',
    body: 'Fund high-priority goals first, then allocate the remainder.',
    badge: 'FR4 plan engine',
    metric: '3 active priorities',
    icon: 'flag',
    tone: 'success',
    route: '/(finance)/financial-goals',
  },
  {
    id: 'portfolio',
    title: 'Portfolio & Rebalancing',
    body: 'Monitor drift and review rebalance ideas by goal.',
    badge: 'FR5 rebalance',
    metric: '2 drifts detected',
    icon: 'donut-large',
    tone: 'warning',
    route: '/(finance)/investments',
  },
  {
    id: 'alerts',
    title: 'Stocks & Alerts',
    body: 'Track catalysts and open a review when a signal matters.',
    badge: 'FR2 watchlist',
    metric: '5 watchlist names',
    icon: 'notifications-active',
    tone: 'error',
    route: '/(finance)/investments',
  },
  {
    id: 'ocr',
    title: 'OCR Intake',
    body: 'Import receipts or statements and review extracted fields.',
    badge: 'FR7 OCR pipeline',
    metric: 'Receipt flow ready',
    icon: 'document-scanner',
    tone: 'primaryDark',
    route: '/(assistant)/receipt-upload',
  },
  {
    id: 'news',
    title: 'News Intelligence',
    body: 'Surface only the macro events that affect your plan.',
    badge: 'FR8 news monitor',
    metric: '3 high-impact briefs',
    icon: 'newspaper',
    tone: 'secondary',
    route: '/(tabs)/news-resources',
  },
  {
    id: 'budgeting',
    title: 'Smart Budgeting',
    body: 'Keep monthly spending aligned with the plan.',
    badge: 'Execution control',
    metric: '1 planner workspace',
    icon: 'savings',
    tone: 'success',
    route: '/(tabs)/smart-budgeting',
  },
  {
    id: 'discipline',
    title: 'Discipline Score',
    body: 'Track adherence, streaks and coaching signals.',
    badge: 'FR10 engagement',
    metric: 'Level 4 discipline',
    icon: 'emoji-events',
    tone: 'warning',
    route: '/(tabs)/achievements',
  },
];

export const proposalTopPriorities: ProposalPriorityItem[] = [
  {
    id: 'priority-goals',
    title: 'Emergency goal still leads',
    detail: 'Keep funding the safety layer before adding risk.',
    status: 'Planner',
    icon: 'flag',
    tone: 'success',
    route: '/(finance)/financial-goals',
  },
  {
    id: 'priority-drift',
    title: 'Growth sleeve is above target',
    detail: 'Review drift before the next monthly top-up.',
    status: 'Portfolio',
    icon: 'donut-large',
    tone: 'warning',
    route: '/(finance)/investments',
  },
  {
    id: 'priority-ocr',
    title: 'One OCR import needs review',
    detail: 'Confirm extracted fields before advice refreshes.',
    status: 'Inputs',
    icon: 'document-scanner',
    tone: 'primaryDark',
    route: '/(assistant)/receipt-upload',
  },
  {
    id: 'priority-news',
    title: 'Earnings cluster starts tomorrow',
    detail: 'High-impact signals are ready in the monitoring feed.',
    status: 'News',
    icon: 'campaign',
    tone: 'error',
    route: '/(tabs)/news-resources',
  },
];

export const proposalJourneySteps: ProposalJourneyStep[] = [
  {
    id: 'step-assess',
    title: 'Assess',
    body: 'Update risk, income resilience and cash-flow constraints.',
    status: 'Ready to refresh',
    icon: 'analytics',
    tone: 'primaryDark',
    route: '/(finance)/financial-assessment',
  },
  {
    id: 'step-plan',
    title: 'Plan',
    body: 'Split available money across urgent and long-term goals.',
    status: 'Planner active',
    icon: 'flag-circle',
    tone: 'success',
    route: '/(finance)/financial-goals',
  },
  {
    id: 'step-monitor',
    title: 'Monitor',
    body: 'Follow subscriptions, spending drift, watchlist catalysts and macro news.',
    status: '3 alerts waiting',
    icon: 'visibility',
    tone: 'warning',
    route: '/(tabs)/news-resources',
  },
  {
    id: 'step-explain',
    title: 'Explain',
    body: 'Read the assumptions, risk notes and evidence behind every suggestion.',
    status: 'Evidence attached',
    icon: 'lightbulb',
    tone: 'secondary',
    route: '/(tabs)/assistant',
  },
  {
    id: 'step-act',
    title: 'Act',
    body: 'Rebalance positions, adjust budgets or import new data from OCR.',
    status: '2 actions queued',
    icon: 'task-alt',
    tone: 'error',
    route: '/(finance)/investments',
  },
];

export const proposalExplainabilityPoints: ProposalExplainabilityPoint[] = [
  {
    id: 'goal-link',
    title: 'Goal link',
    body: 'Advice shows which goal benefits and what gets deferred.',
    icon: 'link',
    tone: 'primaryDark',
  },
  {
    id: 'uncertainty',
    title: 'Uncertainty stays visible',
    body: 'Signals keep assumptions and invalidation cues on-screen.',
    icon: 'rule',
    tone: 'warning',
  },
  {
    id: 'guardrails',
    title: 'Guardrails stay on',
    body: 'No auto-trading, no guaranteed returns, always user review.',
    icon: 'shield',
    tone: 'success',
  },
];

export const proposalNewsSignals: ProposalNewsSignal[] = [
  {
    id: 'rates',
    title: 'Rate-cut expectations are shifting again',
    impact: 'High impact on growth holdings',
    body: 'Quality tech sentiment is improving, but cash yields may compress.',
    symbol: 'NVDA / MSFT',
    icon: 'show-chart',
    tone: 'primaryDark',
    route: '/(tabs)/news-resources',
  },
  {
    id: 'energy',
    title: 'Oil volatility is pressuring transport and living costs',
    impact: 'Medium impact on budget plan',
    body: 'Commute and utility assumptions may need a temporary buffer.',
    symbol: 'Budget guardrail',
    icon: 'local-gas-station',
    tone: 'warning',
    route: '/(tabs)/smart-budgeting',
  },
  {
    id: 'earnings',
    title: 'Mega-cap earnings cluster starts tomorrow',
    impact: 'High impact on portfolio drift',
    body: 'Concentration risk may rise if one name drives most of the move.',
    symbol: 'AAPL / GOOGL',
    icon: 'campaign',
    tone: 'error',
    route: '/(finance)/investments',
  },
];

export const proposalBacktestMetrics: ProposalBacktestMetric[] = [
  { id: 'cagr', label: '5Y CAGR', value: '12.8%', note: 'goal-aligned ruleset' },
  { id: 'dd', label: 'Max Drawdown', value: '-13.4%', note: 'contained by cash sleeve' },
  { id: 'sharpe', label: 'Sharpe', value: '1.11', note: 'risk-adjusted edge' },
  { id: 'hit', label: 'Positive Months', value: '41 / 60', note: 'behaviourally stable' },
];

export const proposalRebalanceActions: ProposalRebalanceAction[] = [
  {
    id: 'trim-overweight',
    title: 'Trim concentrated growth exposure',
    body: 'Two names are driving too much of current volatility.',
    impact: 'Reduces drawdown risk before goal funding windows',
    icon: 'call-split',
    tone: 'warning',
  },
  {
    id: 'fund-buffer',
    title: 'Redirect one monthly top-up to emergency buffer',
    body: 'Short-term resilience is still behind the current profile.',
    impact: 'Strengthens downside protection and plan durability',
    icon: 'health-and-safety',
    tone: 'success',
  },
  {
    id: 'keep-watch',
    title: 'Hold quality names, but tighten alert thresholds',
    body: 'Keep exposure, but tighten catalysts and alert thresholds.',
    impact: 'Keeps upside exposure while improving control',
    icon: 'notifications-none',
    tone: 'primaryDark',
  },
];

export const proposalAdvisorSnapshot = {
  disciplineScore: 84,
  activeGoals: 3,
  queuedActions: 2,
  highImpactSignals: 3,
  summary: 'Plan is stable, but the safety layer still needs attention before the next rebalance.',
};
