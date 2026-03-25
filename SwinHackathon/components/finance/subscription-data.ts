import { FinanceIconName } from '@/components/home/mock-data';

export type SubscriptionTone = 'primaryDark' | 'success' | 'warning' | 'error';
export type SubscriptionCycle = 'Monthly' | 'Yearly';
export type SubscriptionStatus = 'Active' | 'Paused';
export type SubscriptionSetupType = 'Entertainment' | 'Software' | 'Fitness' | 'Delivery';

export type SubscriptionCharge = {
  id: string;
  label: string;
  date: string;
  amount: number;
};

export type SubscriptionItem = {
  id: string;
  name: string;
  icon: FinanceIconName;
  tone: SubscriptionTone;
  plan: string;
  category: string;
  amount: number;
  cycle: SubscriptionCycle;
  status: SubscriptionStatus;
  nextPayment: string;
  startedOn: string;
  paymentMethod: string;
  autoRenew: boolean;
  description: string;
  charges: SubscriptionCharge[];
};

export type SubscriptionPaymentRow = SubscriptionCharge & {
  subscriptionId: string;
  subscriptionName: string;
  plan: string;
  paymentMethod: string;
  tone: SubscriptionTone;
  icon: FinanceIconName;
  status: 'Paid' | 'Processing';
};

export type SubscriptionIntroHighlight = {
  id: string;
  title: string;
  body: string;
  icon: FinanceIconName;
  tone: SubscriptionTone;
};

export type SubscriptionServiceOption = {
  id: string;
  service: string;
  type: SubscriptionSetupType;
  amount: number;
  cycle: SubscriptionCycle;
  icon: FinanceIconName;
  accent: string;
};

export const subscriptionItems: SubscriptionItem[] = [
  {
    id: 'netflix',
    name: 'Netflix Entertainment',
    icon: 'smart-display',
    tone: 'error',
    plan: 'Premium 4K',
    category: 'Entertainment',
    amount: 19.1,
    cycle: 'Monthly',
    status: 'Active',
    nextPayment: 'Jun 12',
    startedOn: 'Jan 2024',
    paymentMethod: 'Visa •• 1260',
    autoRenew: true,
    description: 'Streaming video and family profiles for movie nights.',
    charges: [
      { id: 'n-1', label: 'May payment', date: 'May 12', amount: 19.1 },
      { id: 'n-2', label: 'Apr payment', date: 'Apr 12', amount: 19.1 },
      { id: 'n-3', label: 'Mar payment', date: 'Mar 12', amount: 19.1 },
    ],
  },
  {
    id: 'spotify',
    name: 'Spotify',
    icon: 'graphic-eq',
    tone: 'success',
    plan: 'Duo',
    category: 'Music',
    amount: 12.99,
    cycle: 'Monthly',
    status: 'Active',
    nextPayment: 'Jun 18',
    startedOn: 'Oct 2023',
    paymentMethod: 'Main Wallet',
    autoRenew: true,
    description: 'Music and podcast streaming for daily commute and work.',
    charges: [
      { id: 's-1', label: 'May payment', date: 'May 18', amount: 12.99 },
      { id: 's-2', label: 'Apr payment', date: 'Apr 18', amount: 12.99 },
      { id: 's-3', label: 'Mar payment', date: 'Mar 18', amount: 12.99 },
    ],
  },
  {
    id: 'notion',
    name: 'Notion AI',
    icon: 'dashboard-customize',
    tone: 'primaryDark',
    plan: 'Plus + AI',
    category: 'Productivity',
    amount: 8,
    cycle: 'Monthly',
    status: 'Active',
    nextPayment: 'Jun 25',
    startedOn: 'Feb 2025',
    paymentMethod: 'Mastercard •• 4112',
    autoRenew: true,
    description: 'Workspace planning, notes and AI drafting tools for projects.',
    charges: [
      { id: 'o-1', label: 'May payment', date: 'May 25', amount: 8 },
      { id: 'o-2', label: 'Apr payment', date: 'Apr 25', amount: 8 },
      { id: 'o-3', label: 'Mar payment', date: 'Mar 25', amount: 8 },
    ],
  },
  {
    id: 'gym',
    name: 'Pulse Gym',
    icon: 'fitness-center',
    tone: 'warning',
    plan: 'Standard',
    category: 'Health',
    amount: 24,
    cycle: 'Monthly',
    status: 'Paused',
    nextPayment: 'Paused',
    startedOn: 'Sep 2024',
    paymentMethod: 'Visa •• 1260',
    autoRenew: false,
    description: 'Workout classes and recovery sessions. Paused for this month.',
    charges: [
      { id: 'g-1', label: 'Apr payment', date: 'Apr 04', amount: 24 },
      { id: 'g-2', label: 'Mar payment', date: 'Mar 04', amount: 24 },
      { id: 'g-3', label: 'Feb payment', date: 'Feb 04', amount: 24 },
    ],
  },
];

export const subscriptionCalendar: {
  id: string;
  day: string;
  month: string;
  title: string;
  tone: SubscriptionTone;
  status: string;
}[] = [
  { id: 'c1', day: '12', month: 'Jun', title: 'Netflix', tone: 'error', status: 'Due today' },
  { id: 'c2', day: '18', month: 'Jun', title: 'Spotify', tone: 'success', status: 'In 6 days' },
  { id: 'c3', day: '25', month: 'Jun', title: 'Notion', tone: 'primaryDark', status: 'In 13 days' },
  { id: 'c4', day: '04', month: 'Jul', title: 'Pulse Gym', tone: 'warning', status: 'Paused' },
];

export const subscriptionInsights = [
  { id: 'insight-1', title: 'Potential yearly save', value: '$119', tone: 'success' as const },
  { id: 'insight-2', title: 'Avg. renewal confidence', value: '92%', tone: 'primaryDark' as const },
  { id: 'insight-3', title: 'Unused services', value: '1 paused', tone: 'warning' as const },
];

export const subscriptionRecommendations = [
  'Pause Pulse Gym until your current streak returns above 3 visits per week.',
  'Bundle Netflix and Spotify renewals into the same card to simplify alerts.',
  'Review yearly billing for Notion AI if you keep using it every week.',
];

export const subscriptionIntroHighlights: SubscriptionIntroHighlight[] = [
  {
    id: 'intro-track',
    title: 'Track every renewal',
    body: 'See upcoming billing dates in one place instead of checking each service manually.',
    icon: 'calendar-month',
    tone: 'primaryDark',
  },
  {
    id: 'intro-open',
    title: 'Open any plan instantly',
    body: 'Choose an existing plan first, then inspect details, history and controls.',
    icon: 'folder-open',
    tone: 'success',
  },
  {
    id: 'intro-optimise',
    title: 'Find savings faster',
    body: 'Use insights, history and payment views to spot plans worth pausing or cancelling.',
    icon: 'savings',
    tone: 'warning',
  },
];

export const subscriptionCategories = ['Entertainment', 'Music', 'Productivity', 'Health', 'Utilities'];
export const subscriptionTypes: SubscriptionSetupType[] = [
  'Entertainment',
  'Software',
  'Fitness',
  'Delivery',
];
export const subscriptionCycles: SubscriptionCycle[] = ['Monthly', 'Yearly'];
export const subscriptionPaymentMethods = ['Main Wallet', 'Visa •• 1260', 'Mastercard •• 4112'];
export const subscriptionDueDateOptions = ['Jun 12', 'Jun 18', 'Jun 25', 'Jul 04', 'Jul 11'];
export const subscriptionServices: SubscriptionServiceOption[] = [
  {
    id: 'netflix',
    service: 'Netflix',
    type: 'Entertainment',
    amount: 19.1,
    cycle: 'Monthly',
    icon: 'smart-display',
    accent: '#E85D75',
  },
  {
    id: 'spotify',
    service: 'Spotify',
    type: 'Entertainment',
    amount: 12.99,
    cycle: 'Monthly',
    icon: 'graphic-eq',
    accent: '#53B97E',
  },
  {
    id: 'notion',
    service: 'Notion AI',
    type: 'Software',
    amount: 8,
    cycle: 'Monthly',
    icon: 'dashboard-customize',
    accent: '#365CF5',
  },
  {
    id: 'gym',
    service: 'Pulse Gym',
    type: 'Fitness',
    amount: 24,
    cycle: 'Monthly',
    icon: 'fitness-center',
    accent: '#D1A548',
  },
];

export function getSubscriptionById(id?: string | null) {
  if (!id) {
    return null;
  }

  return subscriptionItems.find((item) => item.id === id) ?? null;
}

export function getSubscriptionPayments(): SubscriptionPaymentRow[] {
  return subscriptionItems
    .flatMap((item) =>
      item.charges.map((charge, index) => {
        const status: SubscriptionPaymentRow['status'] =
          index === 0 && item.status === 'Paused' ? 'Processing' : 'Paid';

        return {
          ...charge,
          subscriptionId: item.id,
          subscriptionName: item.name,
          plan: item.plan,
          paymentMethod: item.paymentMethod,
          tone: item.tone,
          icon: item.icon,
          status,
        };
      })
    )
    .sort((left, right) => right.date.localeCompare(left.date));
}
