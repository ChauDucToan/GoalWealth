import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type SubscriptionIconName = React.ComponentProps<typeof MaterialIcons>['name'];
export type SubscriptionTone = 'brand' | 'success' | 'warning' | 'danger' | 'neutral';
export type SubscriptionCycle = 'Weekly' | 'Monthly' | 'Bi-Monthly' | 'Yearly';
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export type SubscriptionCharge = {
  id: string;
  label: string;
  amount: number;
  date: string;
  status: 'paid' | 'pending';
};

export type SubscriptionItem = {
  id: string;
  service: string;
  shortLabel: string;
  icon: SubscriptionIconName;
  accent: string;
  tone: SubscriptionTone;
  category: string;
  type: string;
  plan: string;
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

export const subscriptionItems: SubscriptionItem[] = [
  {
    id: 'netflix',
    service: 'Netflix Entertainment',
    shortLabel: 'Netflix',
    icon: 'play-circle-outline',
    accent: '#E11D48',
    tone: 'danger',
    category: 'Streaming',
    type: 'Entertainment',
    plan: 'Premium Plan',
    amount: 19.1,
    cycle: 'Monthly',
    status: 'active',
    nextPayment: 'May 28, 2023',
    startedOn: 'Jan 07, 2023',
    paymentMethod: 'Visa •• 9407',
    autoRenew: true,
    description: 'Shared entertainment plan with 4K streaming and multiple devices.',
    charges: [
      { id: 'n1', label: 'Apr billing', amount: 19.1, date: 'Apr 28, 2023', status: 'paid' },
      { id: 'n2', label: 'Mar billing', amount: 19.1, date: 'Mar 28, 2023', status: 'paid' },
      { id: 'n3', label: 'Upcoming billing', amount: 19.1, date: 'May 28, 2023', status: 'pending' },
    ],
  },
  {
    id: 'spotify',
    service: 'Spotify',
    shortLabel: 'Spotify',
    icon: 'graphic-eq',
    accent: '#22C55E',
    tone: 'success',
    category: 'Music',
    type: 'Entertainment',
    plan: 'Duo',
    amount: 8.99,
    cycle: 'Monthly',
    status: 'active',
    nextPayment: 'Jun 02, 2023',
    startedOn: 'Feb 11, 2023',
    paymentMethod: 'Mastercard •• 7811',
    autoRenew: true,
    description: 'Music streaming for two listeners with offline downloads.',
    charges: [
      { id: 's1', label: 'May billing', amount: 8.99, date: 'May 02, 2023', status: 'paid' },
      { id: 's2', label: 'Apr billing', amount: 8.99, date: 'Apr 02, 2023', status: 'paid' },
    ],
  },
  {
    id: 'gym',
    service: 'Pulse Gym',
    shortLabel: 'Gym',
    icon: 'fitness-center',
    accent: '#F59E0B',
    tone: 'warning',
    category: 'Health',
    type: 'Fitness',
    plan: 'Unlimited',
    amount: 35,
    cycle: 'Monthly',
    status: 'paused',
    nextPayment: 'Paused',
    startedOn: 'Oct 14, 2022',
    paymentMethod: 'Bank Debit',
    autoRenew: false,
    description: 'Gym membership including classes and weekend access.',
    charges: [
      { id: 'g1', label: 'Apr billing', amount: 35, date: 'Apr 14, 2023', status: 'paid' },
      { id: 'g2', label: 'Paused on', amount: 0, date: 'May 11, 2023', status: 'pending' },
    ],
  },
  {
    id: 'notion',
    service: 'Notion AI',
    shortLabel: 'Notion',
    icon: 'lightbulb-outline',
    accent: '#6366F1',
    tone: 'brand',
    category: 'Productivity',
    type: 'Software',
    plan: 'Pro + AI',
    amount: 12,
    cycle: 'Monthly',
    status: 'active',
    nextPayment: 'Jun 09, 2023',
    startedOn: 'Mar 09, 2023',
    paymentMethod: 'Visa •• 9407',
    autoRenew: true,
    description: 'Workspace subscription for notes, docs and AI assistance.',
    charges: [
      { id: 'no1', label: 'May billing', amount: 12, date: 'May 09, 2023', status: 'paid' },
      { id: 'no2', label: 'Apr billing', amount: 12, date: 'Apr 09, 2023', status: 'paid' },
    ],
  },
];

export const subscriptionServices = subscriptionItems.map((item) => ({
  id: item.id,
  service: item.service,
  shortLabel: item.shortLabel,
  icon: item.icon,
  accent: item.accent,
  type: item.type,
  amount: item.amount,
  cycle: item.cycle,
}));

export const subscriptionTypes = ['Entertainment', 'Software', 'Fitness', 'Delivery'] as const;
export const subscriptionCycles: SubscriptionCycle[] = ['Weekly', 'Monthly', 'Bi-Monthly', 'Yearly'];
export const subscriptionPaymentMethods = ['Visa •• 9407', 'Mastercard •• 7811', 'Bank Debit', 'Apple Pay'] as const;
export const subscriptionCategories = ['Streaming', 'Music', 'Health', 'Productivity', 'Utilities'] as const;

export const subscriptionCalendar = [
  { label: 'May 21', amount: '$8.99', service: 'Spotify', accent: '#22C55E' },
  { label: 'May 28', amount: '$19.10', service: 'Netflix', accent: '#E11D48' },
  { label: 'Jun 02', amount: '$12.00', service: 'Notion AI', accent: '#6366F1' },
];

export const subscriptionRecommendations = [
  {
    id: 'trim-streaming',
    title: 'Audit overlapping entertainment plans',
    body: 'Streaming subscriptions account for the highest recurring outflow this month.',
  },
  {
    id: 'pause-unused',
    title: 'Keep paused services visible',
    body: 'Paused plans still need a review date so they do not silently restart.',
  },
  {
    id: 'optimize-method',
    title: 'Move renewals to one payment method',
    body: 'A single billing card makes failed renewals easier to catch before due day.',
  },
];

export const subscriptionInsights = {
  totalMonthly: 42.5,
  yearlyProjection: 510,
  activeCount: subscriptionItems.filter((item) => item.status === 'active').length,
  pausedCount: subscriptionItems.filter((item) => item.status === 'paused').length,
  nextChargeLabel: 'May 28',
};

export const subscriptionHistoryRows = subscriptionItems.flatMap((item) =>
  item.charges.map((charge) => ({
    id: `${item.id}-${charge.id}`,
    service: item.shortLabel,
    amount: charge.amount,
    date: charge.date,
    status: charge.status,
    accent: item.accent,
    icon: item.icon,
  }))
);

export function getSubscriptionById(id?: string) {
  return subscriptionItems.find((item) => item.id === id) ?? subscriptionItems[0];
}
