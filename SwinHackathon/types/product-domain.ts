export type AppRoute = string;

export type DataFreshnessStatus = 'fresh' | 'delayed' | 'stale' | 'processing';

export type DataFreshnessMeta = {
  label: string;
  updatedAt: string;
  source: string;
  status: DataFreshnessStatus;
};

export type SuitabilitySeverity = 'info' | 'warning' | 'blocked';

export type SuitabilityGuardrail = {
  id: string;
  title: string;
  body: string;
  severity: SuitabilitySeverity;
  nextStep?: string;
};

export type RiskWarningLevel = 'low' | 'moderate' | 'high';

export type RiskWarning = {
  id: string;
  title: string;
  body: string;
  level: RiskWarningLevel;
};

export type AlternativeOption = {
  id: string;
  title: string;
  body: string;
  suitability: string;
  route?: AppRoute;
};

export type GoalImpact = {
  goalId: string;
  goalTitle: string;
  priorityLabel: string;
  impact: string;
  changeLabel: string;
};

export type AdvisorAction = {
  id: string;
  label: string;
  body: string;
  route?: AppRoute;
  status: 'next' | 'monitor' | 'review';
};

export type EvidenceSummary = {
  id: string;
  title: string;
  body: string;
  source: string;
  toolName: string;
};

export type ExplainabilityBlock = {
  whyThisRecommendation: string;
  assumptions: string[];
  uncertainty: string;
  whatChangesThisAdvice: string;
  dataInputs: string[];
};

export type BackgroundJobStatus = {
  id: string;
  title: string;
  type: 'backtest' | 'ocr' | 'monitoring' | 'analysis';
  status: 'queued' | 'running' | 'review' | 'completed' | 'blocked';
  detail: string;
  etaLabel?: string;
  updatedAt: string;
};

export type AdvisorRecommendation = {
  id: string;
  title: string;
  summary: string;
  confidenceLabel: string;
  recommendationLabel: string;
  freshness: DataFreshnessMeta;
  explainability: ExplainabilityBlock;
  evidence: EvidenceSummary[];
  goalImpacts: GoalImpact[];
  riskWarnings: RiskWarning[];
  alternatives: AlternativeOption[];
  actions: AdvisorAction[];
  guardrails: SuitabilityGuardrail[];
};

export type AllocationSlice = {
  label: string;
  currentWeight: number;
  targetWeight: number;
  drift: number;
};

export type GoalAllocation = {
  goalId: string;
  goalTitle: string;
  priorityLabel: string;
  monthlyAllocation: number;
  currentFunding: number;
  targetFunding: number;
  riskBand: string;
  note: string;
};

export type PortfolioSnapshot = {
  totalValue: number;
  dayChange: number;
  liquidityLabel: string;
  riskProfileLabel: string;
  freshness: DataFreshnessMeta;
  currentAllocation: AllocationSlice[];
  goalAllocations: GoalAllocation[];
};

export type RebalanceRecommendation = {
  id: string;
  title: string;
  summary: string;
  whyNow: string;
  uncertainty: string;
  actionPriority: 'High' | 'Medium' | 'Low';
  goalImpacts: GoalImpact[];
  saferAlternative?: AlternativeOption;
  guardrail?: SuitabilityGuardrail;
};

export type WatchlistAlert = {
  id: string;
  symbol: string;
  title: string;
  trigger: string;
  explanation: string;
  suggestedResponse: 'Review' | 'Rebalance' | 'Do nothing';
  severity: 'High' | 'Medium' | 'Low';
  updatedAt: string;
};

export type BacktestResult = {
  horizonLabel: string;
  cagr: string;
  volatility: string;
  maxDrawdown: string;
  sharpe: string;
  winRate: string;
  turnover: string;
  feeAssumption: string;
  slippageAssumption: string;
  disclaimer: string;
};

export type StrategyEvidence = {
  title: string;
  summary: string;
  backtest: BacktestResult;
  assumptions: string[];
};

export type NewsImpactAlert = {
  id: string;
  title: string;
  impactLabel: string;
  explanation: string;
  affectedArea: string;
  updatedAt: string;
  route?: AppRoute;
};

export type GoalPriority = 'High' | 'Medium' | 'Low';

export type GoalPlanningItem = {
  goalId: string;
  goalType: string;
  goalTitle: string;
  targetAmount: number;
  targetDate: string;
  priority: GoalPriority;
  priorityOrder: number;
  minimumFundingNeed: number;
  allowedRisk: string;
  monthlyContribution: number;
  currentProgress: number;
  feasibilityProbability: number;
  fundingGap: number;
  constraintFlags: string[];
  conflictWithOtherGoals: string[];
  recommendedSequence: number;
  recommendedMonthlyAllocation: number;
};

export type FinancialProfile = {
  monthlyIncome: number;
  savingsRate: number;
  outstandingDebt: number;
  liquidAssets: number;
  monthlyObligations: number;
  emergencyFundMonths: number;
  dependents: number;
};

export type RiskToleranceSummary = {
  label: string;
  body: string;
};

export type FinancialCapacitySummary = {
  label: string;
  monthlyFreeCashEstimate: number;
  liquidityMonths: number;
  debtPressureLabel: string;
};

export type BehavioralSignalSummary = {
  label: string;
  body: string;
};

export type GoalReadinessSummary = {
  readinessLabel: string;
  body: string;
  readinessScore: number;
};

export type SuitabilityCheckResult = {
  status: 'clear' | 'caution' | 'blocked';
  title: string;
  body: string;
};

export type OCRExtractionResult = {
  status: 'not-started' | 'review-needed' | 'ready';
  title: string;
  fieldsDetected: number;
  body: string;
};

export type AssessmentResult = {
  profile: FinancialProfile;
  riskTolerance: RiskToleranceSummary;
  financialCapacity: FinancialCapacitySummary;
  behavioralSignals: BehavioralSignalSummary;
  goalReadiness: GoalReadinessSummary;
  suitability: SuitabilityCheckResult;
  ocr: OCRExtractionResult;
  nextActions: AdvisorAction[];
};
