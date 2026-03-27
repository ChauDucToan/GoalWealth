import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type FinanceIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export type FinanceTransaction = {
  id: string;
  merchant: string;
  category: string;
  amount: number;
  type: 'income' | 'expense';
  status: 'Completed' | 'Pending';
  dateLabel: string;
  timeLabel: string;
  note: string;
  icon: FinanceIconName;
  accent: string;
  paymentMethod: string;
  location: string;
  reference: string;
};

export type WalletAccount = {
  id: string;
  label: string;
  numberMask: string;
  balance: number;
  changeLabel: string;
  accent: string;
};

export type FinanceGoal = {
  id: string;
  title: string;
  saved: number;
  target: number;
  dueLabel: string;
  icon: FinanceIconName;
  accent: string;
};

export type FinanceCategory = {
  id: string;
  name: string;
  spent: number;
  limit: number;
  icon: FinanceIconName;
  accent: string;
};

export type UpcomingBill = {
  id: string;
  name: string;
  amount: number;
  dueLabel: string;
  icon: FinanceIconName;
  accent: string;
};

export type ResourceCard = {
  id: string;
  title: string;
  source: string;
  caption: string;
  accent: string;
};

export type ActivityHighlight = {
  id: string;
  title: string;
  value: string;
  detail: string;
  icon: FinanceIconName;
  accent: string;
};

export type MerchantHighlight = {
  id: string;
  label: string;
  count: string;
  icon: FinanceIconName;
  accent: string;
};

export type FinanceRecipient = {
  id: string;
  name: string;
  subtitle: string;
  icon: FinanceIconName;
  accent: string;
};

export type StockQuote = {
  symbol: string;
  name: string;
  sector: string;
  price: number;
  dayChange: number;
  changePercent: number;
  chart: number[];
  accent: string;
  icon: FinanceIconName;
  marketCap: string;
  volume: string;
  peRatio: string;
  about: string;
};

export type StockHolding = {
  symbol: string;
  shares: number;
  averageCost: number;
};

export const overviewStats = {
  balance: 827.21,
  income: 1840.0,
  expenses: 1012.79,
  budgetLeft: 100.0,
  safeToSpend: 241.3,
  savingsTarget: 2500.0,
  savingsProgress: 1685.0,
};

export const walletAccounts: WalletAccount[] = [
  {
    id: 'main-wallet',
    label: 'Main Wallet',
    numberMask: '•••• 9407',
    balance: 827.21,
    changeLabel: '+4.8% this month',
    accent: '#1573fe',
  },
  {
    id: 'savings-jar',
    label: 'Savings Jar',
    numberMask: '•••• 1138',
    balance: 1685.0,
    changeLabel: '+$120 auto saved',
    accent: '#22C55E',
  },
  {
    id: 'travel-fund',
    label: 'Travel Fund',
    numberMask: 'Goal bucket',
    balance: 480.0,
    changeLabel: 'Paris trip goal',
    accent: '#8B5CF6',
  },
];

export const quickActions: {
  id: string;
  title: string;
  subtitle: string;
  icon: FinanceIconName;
}[] = [
  {
    id: 'send',
    title: 'Send',
    subtitle: 'Money transfer',
    icon: 'north-east',
  },
  {
    id: 'request',
    title: 'Request',
    subtitle: 'Ask payment',
    icon: 'south-west',
  },
  {
    id: 'budget',
    title: 'Budget',
    subtitle: 'Track limit',
    icon: 'account-balance-wallet',
  },
  {
    id: 'receipt',
    title: 'Bills',
    subtitle: 'Keep records',
    icon: 'receipt-long',
  },
  {
    id: 'assessment',
    title: 'Assess',
    subtitle: 'Financial profile',
    icon: 'fact-check',
  },
];

export const budgetCategories: FinanceCategory[] = [
  {
    id: 'home',
    name: 'Housing',
    spent: 620,
    limit: 800,
    icon: 'apartment',
    accent: '#1573fe',
  },
  {
    id: 'food',
    name: 'Food',
    spent: 280,
    limit: 420,
    icon: 'restaurant',
    accent: '#22C55E',
  },
  {
    id: 'transport',
    name: 'Transport',
    spent: 74,
    limit: 220,
    icon: 'commute',
    accent: '#FACC15',
  },
  {
    id: 'shopping',
    name: 'Shopping',
    spent: 112,
    limit: 250,
    icon: 'shopping-bag',
    accent: '#EF4444',
  },
];

export const financeGoals: FinanceGoal[] = [
  {
    id: 'travel',
    title: 'Summer Trip',
    saved: 1480,
    target: 2400,
    dueLabel: '84 days left',
    icon: 'flight-takeoff',
    accent: '#1573fe',
  },
  {
    id: 'emergency',
    title: 'Emergency Fund',
    saved: 3200,
    target: 5000,
    dueLabel: 'Build to 6 months',
    icon: 'health-and-safety',
    accent: '#22C55E',
  },
];

export const upcomingBills: UpcomingBill[] = [
  {
    id: 'netflix',
    name: 'Netflix',
    amount: 15.99,
    dueLabel: 'Due tomorrow',
    icon: 'subscriptions',
    accent: '#EF4444',
  },
  {
    id: 'spotify',
    name: 'Spotify',
    amount: 8.99,
    dueLabel: 'Due in 3 days',
    icon: 'headphones',
    accent: '#22C55E',
  },
  {
    id: 'rent',
    name: 'Apartment Rent',
    amount: 620,
    dueLabel: 'Due on Mar 28',
    icon: 'apartment',
    accent: '#1573fe',
  },
];

export const transactionsSeed: FinanceTransaction[] = [
  {
    id: 'txn-1',
    merchant: 'Netflix, Inc',
    category: 'Subscription',
    amount: -45.51,
    type: 'expense',
    status: 'Completed',
    dateLabel: 'Today',
    timeLabel: '09:24 AM',
    note: 'Monthly subscription charge',
    icon: 'subscriptions',
    accent: '#EF4444',
    paymentMethod: 'Visa •••• 9407',
    location: 'Online',
    reference: 'INV-NTFX-9302',
  },
  {
    id: 'txn-2',
    merchant: 'Target Market',
    category: 'Groceries',
    amount: -82.17,
    type: 'expense',
    status: 'Completed',
    dateLabel: 'Today',
    timeLabel: '08:15 AM',
    note: 'Household and kitchen supplies',
    icon: 'shopping-bag',
    accent: '#22C55E',
    paymentMethod: 'Apple Pay',
    location: 'Swanston St',
    reference: 'POS-TRG-8841',
  },
  {
    id: 'txn-3',
    merchant: 'Salary Deposit',
    category: 'Income',
    amount: 500.0,
    type: 'income',
    status: 'Completed',
    dateLabel: 'Yesterday',
    timeLabel: '06:00 PM',
    note: 'Bi-weekly salary transfer',
    icon: 'payments',
    accent: '#1573fe',
    paymentMethod: 'Bank transfer',
    location: 'GoalWealth Payroll',
    reference: 'PAY-2026-03-20',
  },
  {
    id: 'txn-4',
    merchant: 'City Taxi',
    category: 'Transport',
    amount: -18.45,
    type: 'expense',
    status: 'Pending',
    dateLabel: 'Yesterday',
    timeLabel: '03:20 PM',
    note: 'Airport transfer reimbursement pending',
    icon: 'local-taxi',
    accent: '#F59E0B',
    paymentMethod: 'Mastercard •••• 2108',
    location: 'Melbourne Airport',
    reference: 'RIDE-3107',
  },
  {
    id: 'txn-5',
    merchant: 'Whole Beans Cafe',
    category: 'Dining',
    amount: -12.9,
    type: 'expense',
    status: 'Completed',
    dateLabel: 'Mar 18',
    timeLabel: '11:10 AM',
    note: 'Coffee meeting',
    icon: 'local-cafe',
    accent: '#8B5CF6',
    paymentMethod: 'Visa •••• 9407',
    location: 'CBD',
    reference: 'POS-CAFE-1993',
  },
  {
    id: 'txn-6',
    merchant: 'Transfer from Savings',
    category: 'Transfer',
    amount: 100.0,
    type: 'income',
    status: 'Completed',
    dateLabel: 'Mar 17',
    timeLabel: '07:45 AM',
    note: 'Monthly buffer adjustment',
    icon: 'sync-alt',
    accent: '#0EA5E9',
    paymentMethod: 'Savings jar',
    location: 'Internal transfer',
    reference: 'TRF-100-8821',
  },
  {
    id: 'txn-7',
    merchant: 'Amazon',
    category: 'Shopping',
    amount: -68.25,
    type: 'expense',
    status: 'Completed',
    dateLabel: 'Mar 16',
    timeLabel: '09:12 PM',
    note: 'Desk accessories and notebook',
    icon: 'shopping-cart',
    accent: '#F97316',
    paymentMethod: 'Visa •••• 9407',
    location: 'Online',
    reference: 'AMZ-77451',
  },
];

export const spendingInsights = [
  {
    label: 'Mon',
    value: 60,
    amount: 148.2,
    transactions: 5,
    topCategory: 'Food',
    summary: 'Cafe, lunch and one grocery refill.',
  },
  {
    label: 'Tue',
    value: 82,
    amount: 203.7,
    transactions: 7,
    topCategory: 'Shopping',
    summary: 'Higher than average because of an online order.',
  },
  {
    label: 'Wed',
    value: 48,
    amount: 119.4,
    transactions: 4,
    topCategory: 'Transport',
    summary: 'Mostly commuting and one coffee stop.',
  },
  {
    label: 'Thu',
    value: 94,
    amount: 241.9,
    transactions: 8,
    topCategory: 'Bills',
    summary: 'Subscription renewals and rent top-up posted today.',
  },
  {
    label: 'Fri',
    value: 74,
    amount: 186.1,
    transactions: 6,
    topCategory: 'Dining',
    summary: 'Dinner and weekly household spending pushed the total up.',
  },
  {
    label: 'Sat',
    value: 58,
    amount: 142.8,
    transactions: 5,
    topCategory: 'Entertainment',
    summary: 'Balanced spending with one weekend activity.',
  },
  {
    label: 'Sun',
    value: 68,
    amount: 167.5,
    transactions: 4,
    topCategory: 'Groceries',
    summary: 'Groceries and prep spending for next week.',
  },
];

export const activityHighlights: ActivityHighlight[] = [
  {
    id: 'safe',
    title: 'Safe to spend',
    value: '$241.30',
    detail: 'after upcoming bills',
    icon: 'verified',
    accent: '#1573fe',
  },
  {
    id: 'streak',
    title: 'Saving streak',
    value: '6 weeks',
    detail: 'auto-save active',
    icon: 'whatshot',
    accent: '#FACC15',
  },
];

export const merchantHighlights: MerchantHighlight[] = [
  { id: 'target', label: 'Target', count: '4 txns', icon: 'shopping-bag', accent: '#22C55E' },
  { id: 'netflix', label: 'Netflix', count: '1 bill', icon: 'subscriptions', accent: '#EF4444' },
  { id: 'uber', label: 'Taxi', count: '2 rides', icon: 'local-taxi', accent: '#F59E0B' },
];

export const resourceCards: ResourceCard[] = [
  {
    id: 'budgeting-habit',
    title: 'Why small weekly reviews improve your budget',
    source: 'Money Notes',
    caption: '5 min read',
    accent: '#1573fe',
  },
  {
    id: 'subscriptions-audit',
    title: 'How to audit subscriptions before next payday',
    source: 'Finpal Lab',
    caption: 'Checklist',
    accent: '#22C55E',
  },
];

export const profileActions: {
  id: string;
  label: string;
  icon: FinanceIconName;
}[] = [
  { id: 'cards', label: 'Cards & accounts', icon: 'credit-card' },
  { id: 'limits', label: 'Budget limits', icon: 'pie-chart-outline' },
  { id: 'alerts', label: 'Smart alerts', icon: 'notifications-none' },
  { id: 'security', label: 'Security', icon: 'shield' },
];

export const financeRecipients: FinanceRecipient[] = [
  {
    id: 'amazon',
    name: 'Amazon Payment',
    subtitle: 'Online purchase',
    icon: 'shopping-bag',
    accent: '#F97316',
  },
  {
    id: 'woolworths',
    name: 'Woolo Fargo',
    subtitle: 'Bank transfer',
    icon: 'account-balance',
    accent: '#1573fe',
  },
  {
    id: 'starbucks',
    name: 'Starbucks Coffee',
    subtitle: 'Card payment',
    icon: 'local-cafe',
    accent: '#22C55E',
  },
  {
    id: 'uber',
    name: 'Uber',
    subtitle: 'Taxi service',
    icon: 'local-taxi',
    accent: '#8B5CF6',
  },
  {
    id: 'tesla',
    name: 'Tesla Motors',
    subtitle: 'Charging bill',
    icon: 'electric-car',
    accent: '#EF4444',
  },
];

export const stockQuotes: StockQuote[] = [
  {
    symbol: 'NVDA',
    name: 'NVIDIA Corp.',
    sector: 'AI Infrastructure',
    price: 912.44,
    dayChange: 18.34,
    changePercent: 2.05,
    chart: [36, 42, 46, 54, 52, 61, 66, 72, 68, 79],
    accent: '#1573fe',
    icon: 'memory',
    marketCap: '$2.28T',
    volume: '52.7M',
    peRatio: '66.3',
    about: 'NVIDIA designs accelerated computing hardware powering AI, gaming and data centers.',
  },
  {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    sector: 'Consumer Tech',
    price: 214.32,
    dayChange: 3.84,
    changePercent: 1.82,
    chart: [28, 30, 33, 37, 35, 41, 46, 49, 53, 57],
    accent: '#22C55E',
    icon: 'phonelink',
    marketCap: '$3.31T',
    volume: '61.4M',
    peRatio: '31.6',
    about: 'Apple builds consumer hardware, software and services with a large recurring revenue base.',
  },
  {
    symbol: 'MSFT',
    name: 'Microsoft',
    sector: 'Cloud Platform',
    price: 428.18,
    dayChange: 4.96,
    changePercent: 1.17,
    chart: [24, 29, 31, 35, 40, 44, 43, 48, 52, 58],
    accent: '#0EA5E9',
    icon: 'desktop-windows',
    marketCap: '$3.19T',
    volume: '22.1M',
    peRatio: '36.9',
    about: 'Microsoft combines cloud software, AI products and enterprise subscriptions at large scale.',
  },
  {
    symbol: 'TSLA',
    name: 'Tesla',
    sector: 'EV & Energy',
    price: 188.67,
    dayChange: -4.82,
    changePercent: -2.49,
    chart: [62, 58, 56, 52, 49, 47, 44, 42, 39, 36],
    accent: '#EF4444',
    icon: 'electric-car',
    marketCap: '$601B',
    volume: '94.8M',
    peRatio: '52.4',
    about: 'Tesla produces electric vehicles, energy storage products and autonomous driving software.',
  },
  {
    symbol: 'GOOGL',
    name: 'Alphabet',
    sector: 'Search & Cloud',
    price: 176.41,
    dayChange: 1.63,
    changePercent: 0.93,
    chart: [26, 28, 29, 31, 33, 35, 37, 39, 43, 45],
    accent: '#8B5CF6',
    icon: 'travel-explore',
    marketCap: '$2.14T',
    volume: '26.9M',
    peRatio: '24.8',
    about: 'Alphabet operates Google Search, YouTube, cloud infrastructure and AI research products.',
  },
];

export const stockHoldingsSeed: StockHolding[] = [
  {
    symbol: 'NVDA',
    shares: 2.2,
    averageCost: 801.54,
  },
  {
    symbol: 'AAPL',
    shares: 6,
    averageCost: 184.2,
  },
  {
    symbol: 'MSFT',
    shares: 3.4,
    averageCost: 392.45,
  },
];

export const stockWatchlistSeed = ['NVDA', 'AAPL', 'MSFT', 'TSLA', 'GOOGL'];

export const recurringOptions = [
  'No repeat',
  'Every day',
  'Every week',
  'Every month',
  'Every year',
];

export const transactionSortOptions = [
  'Newest first',
  'Oldest first',
  'Highest amount',
  'Lowest amount',
];

export const categoryIconOptions: FinanceIconName[] = [
  'shopping-bag',
  'restaurant',
  'flight-takeoff',
  'subscriptions',
  'fitness-center',
  'pets',
];

export const categoryColorOptions = ['#1573fe', '#22C55E', '#F59E0B', '#8B5CF6', '#EF4444', '#0EA5E9'];
