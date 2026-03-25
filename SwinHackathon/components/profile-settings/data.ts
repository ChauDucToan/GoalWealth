import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type ProfileIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export type AppearanceOption = 'System' | 'Light' | 'Dark';
export type LanguageOption =
  | 'English (US)'
  | 'Vietnamese'
  | 'Japanese'
  | 'French'
  | 'Spanish';
export type CurrencyOption = 'USD' | 'AUD' | 'EUR' | 'JPY' | 'VND';

export type LinkedAccountItem = {
  id: string;
  type: 'Bank' | 'Card' | 'Wallet';
  label: string;
  subtitle: string;
  balanceLabel: string;
  accent: string;
  icon: ProfileIconName;
  status: 'Active' | 'Pending';
};

export type SupportThread = {
  id: string;
  agent: string;
  preview: string;
  time: string;
  unread: number;
  accent: string;
};

export type FeedbackCategory = {
  id: string;
  label: string;
  icon: ProfileIconName;
};

export type ProfileMenuItem = {
  id: string;
  label: string;
  icon: ProfileIconName;
  route?: string;
  kind?: 'link' | 'toggle' | 'danger';
  summary?: string;
};

export const appearanceOptions: AppearanceOption[] = ['System', 'Light', 'Dark'];
export const languageOptions: LanguageOption[] = [
  'English (US)',
  'Vietnamese',
  'Japanese',
  'French',
  'Spanish',
];
export const currencyOptions: CurrencyOption[] = ['USD', 'AUD', 'EUR', 'JPY', 'VND'];

export const feedbackCategories: FeedbackCategory[] = [
  { id: 'bug', label: 'Bug report', icon: 'bug-report' },
  { id: 'feature', label: 'Feature idea', icon: 'lightbulb-outline' },
  { id: 'design', label: 'Design feedback', icon: 'palette' },
  { id: 'support', label: 'Need support', icon: 'support-agent' },
];

export const linkedAccountsSeed: LinkedAccountItem[] = [
  {
    id: 'acc-savings',
    type: 'Bank',
    label: 'Savings Account',
    subtitle: 'Commonwealth Bank •• 1842',
    balanceLabel: '$12,540.22',
    accent: '#1A73E8',
    icon: 'account-balance',
    status: 'Active',
  },
  {
    id: 'acc-daily',
    type: 'Wallet',
    label: 'Daily Wallet',
    subtitle: 'Finpal balance',
    balanceLabel: '$1,240.80',
    accent: '#6A927A',
    icon: 'account-balance-wallet',
    status: 'Active',
  },
  {
    id: 'acc-card-visa',
    type: 'Card',
    label: 'Visa Platinum',
    subtitle: '•••• 1260',
    balanceLabel: 'Limit $5,000',
    accent: '#B2955A',
    icon: 'credit-card',
    status: 'Active',
  },
  {
    id: 'acc-card-master',
    type: 'Card',
    label: 'Mastercard Travel',
    subtitle: '•••• 4112',
    balanceLabel: 'Pending verify',
    accent: '#B98486',
    icon: 'payments',
    status: 'Pending',
  },
];

export const supportThreads: SupportThread[] = [
  {
    id: 'thread-1',
    agent: 'Olivia · Finpal Support',
    preview: 'Your export request is ready and can be downloaded from the account screen.',
    time: '09:24',
    unread: 2,
    accent: '#1A73E8',
  },
  {
    id: 'thread-2',
    agent: 'Luca · Security Team',
    preview: 'We have enabled login alerts for your profile as requested.',
    time: 'Yesterday',
    unread: 0,
    accent: '#6A927A',
  },
  {
    id: 'thread-3',
    agent: 'Mia · Product',
    preview: 'Thanks for the feedback on linked accounts. The team is reviewing it now.',
    time: 'Mon',
    unread: 0,
    accent: '#B2955A',
  },
];

export const rateReasons = [
  'Fast budgeting flow',
  'Useful reminders',
  'Clean dashboard',
  'Helpful assistant',
];

export const trustedDevices = [
  { id: 'device-1', label: 'Legion 5 · Chrome', time: 'Current session' },
  { id: 'device-2', label: 'iPhone 14 · Safari', time: 'Last active 2 days ago' },
  { id: 'device-3', label: 'Galaxy Tab · App', time: 'Last active 1 week ago' },
];

export const premiumPerks = [
  'Priority assistant replies',
  'Unlimited report exports',
  'Advanced planning and budgeting tools',
];

export const aboutHighlights = [
  { id: 'users', label: 'Active users', value: '12.4k', icon: 'groups' as const },
  { id: 'regions', label: 'Markets', value: '18', icon: 'language' as const },
  { id: 'trust', label: 'Security score', value: 'A+', icon: 'verified-user' as const },
];

export const exportFormats = ['CSV', 'PDF', 'JSON'] as const;
