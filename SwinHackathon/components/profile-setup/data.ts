import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export const avatars = [
  { id: 'avatar-1', label: 'Green Orbit', accent: '#76B82A', icon: 'person' as const },
  { id: 'avatar-2', label: 'Warm Frame', accent: '#F59E0B', icon: 'sentiment-satisfied' as const },
  { id: 'avatar-3', label: 'Blue Spark', accent: '#1573FE', icon: 'face-4' as const },
] as const;

export const avatarHighlights = [
  { id: 'identity', label: 'Identity', value: 'Personalized', icon: 'verified-user' as const },
  { id: 'editable', label: 'Editable', value: 'Change later', icon: 'edit' as const },
  { id: 'trust', label: 'Trust signal', value: 'Visible in profile', icon: 'shield' as const },
] as const;

export const banks = [
  { id: 'chase', label: 'Chase', type: 'Checking •••• 2104', icon: 'account-balance' as const },
  { id: 'boa', label: 'Bank of America', type: 'Savings •••• 8128', icon: 'savings' as const },
  { id: 'capital-one', label: 'Capital One', type: 'Credit •••• 4901', icon: 'credit-card' as const },
  { id: 'wells-fargo', label: 'Wells Fargo', type: 'Checking •••• 9230', icon: 'payments' as const },
] as const;

export const bankHighlights = [
  { id: 'secure', label: '256-bit encryption', icon: 'lock' as const },
  { id: 'read-only', label: 'Read-only sync', icon: 'visibility' as const },
  { id: 'fast', label: '2 minute setup', icon: 'bolt' as const },
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

export const securityHighlights = [
  {
    id: 'biometric',
    title: 'Biometric access',
    body: 'Use Face ID or fingerprint to open the app quickly.',
    icon: 'fingerprint' as const,
  },
  {
    id: 'otp',
    title: 'One-time codes',
    body: 'Sensitive actions still require a quick code check.',
    icon: 'pin' as const,
  },
  {
    id: 'fallback',
    title: 'Passcode backup',
    body: 'A private fallback passcode protects your account if biometrics fail.',
    icon: 'password' as const,
  },
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

export const financeReportHighlights = [
  {
    id: 'momentum',
    title: 'Momentum is strong',
    body: 'You already have the right foundations to start budgets, subscriptions and assistant-led insights.',
    icon: 'trending-up' as const,
  },
  {
    id: 'coverage',
    title: 'Coverage looks healthy',
    body: 'Identity, bank connection and security are all in place, so the app can personalize your recommendations faster.',
    icon: 'insights' as const,
  },
  {
    id: 'next-step',
    title: 'Best next step',
    body: 'Start with goals, smart budgeting and weekly assistant summaries to keep momentum high.',
    icon: 'auto-graph' as const,
  },
] as const;

export const trialBenefits = [
  '7-day premium trial with cancel-anytime flexibility',
  'Unlimited financial reports and personalized insights',
  'Priority assistant replies and smarter planning tools',
] as const;

export type IconName = React.ComponentProps<typeof MaterialIcons>['name'];
