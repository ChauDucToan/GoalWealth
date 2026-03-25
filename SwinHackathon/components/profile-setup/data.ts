import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export const avatars = [
  { id: 'avatar-1', label: 'Green Orbit', accent: '#76B82A', icon: 'person' as const },
  { id: 'avatar-2', label: 'Warm Frame', accent: '#F59E0B', icon: 'sentiment-satisfied' as const },
  { id: 'avatar-3', label: 'Blue Spark', accent: '#1573FE', icon: 'face-4' as const },
] as const;

export const banks = [
  { id: 'chase', label: 'Chase', type: 'Checking •••• 2104', icon: 'account-balance' as const },
  { id: 'boa', label: 'Bank of America', type: 'Savings •••• 8128', icon: 'savings' as const },
  { id: 'capital-one', label: 'Capital One', type: 'Credit •••• 4901', icon: 'credit-card' as const },
  { id: 'wells-fargo', label: 'Wells Fargo', type: 'Checking •••• 9230', icon: 'payments' as const },
] as const;

export const savingsAccounts = [
  { id: 'high-yield', label: 'High Yield Saver', amount: '$4,280.12', helper: 'Primary savings pot' },
  { id: 'travel-fund', label: 'Travel Fund', amount: '$1,240.00', helper: 'Goal based savings' },
  { id: 'emergency', label: 'Emergency Buffer', amount: '$3,920.30', helper: '6 month reserve build' },
] as const;

export const notificationOptions = [
  { id: 'transactions', label: 'Transactions', helper: 'Alerts for new spends and deposits' },
  { id: 'goals', label: 'Goals', helper: 'Milestone reminders and nudges' },
  { id: 'security', label: 'Security', helper: 'Sensitive account activity updates' },
] as const;

export const planOptions = [
  {
    id: 'plus',
    title: 'Finpal Plus',
    price: '$6.99/mo',
    badge: 'Popular',
    bullets: ['Unlimited financial reports', 'Bank account sync', 'Priority assistant replies'],
  },
  {
    id: 'premium',
    title: 'Finpal Premium',
    price: '$11.99/mo',
    badge: 'Best Value',
    bullets: ['Everything in Plus', 'Advanced planning tools', 'Family workspace and premium insights'],
  },
] as const;

export const privacySections = [
  'We encrypt bank-linked data in transit and at rest.',
  'Your notifications and identity settings can be changed later.',
  'You can revoke linked institutions and delete your account data from settings.',
] as const;

export const scoreBreakdown = [
  { label: 'Identity', value: 'Complete' },
  { label: 'Bank link', value: 'Verified' },
  { label: 'Security', value: 'Protected' },
  { label: 'Preferences', value: 'Personalized' },
] as const;

export type IconName = React.ComponentProps<typeof MaterialIcons>['name'];
