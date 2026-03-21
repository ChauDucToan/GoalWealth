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
};

export const overviewStats = {
  balance: 827.21,
  income: 1840.0,
  expenses: 1012.79,
  budgetLeft: 100.0,
  savingsTarget: 2500.0,
};

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
];

export const budgetCategories: {
  id: string;
  name: string;
  spent: number;
  limit: number;
  icon: FinanceIconName;
  accent: string;
}[] = [
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
  },
];

export const spendingInsights = [
  { label: 'Mon', value: 60 },
  { label: 'Tue', value: 82 },
  { label: 'Wed', value: 48 },
  { label: 'Thu', value: 94 },
  { label: 'Fri', value: 74 },
  { label: 'Sat', value: 58 },
  { label: 'Sun', value: 68 },
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
