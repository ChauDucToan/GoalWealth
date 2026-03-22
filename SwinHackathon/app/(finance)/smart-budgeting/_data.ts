export const budgetSummary = {
  total: 3250.54,
  spent: 2052.54,
  left: 1198,
  alert: '2 categories need attention',
};

export type SmartBudgetCategory = {
  id: string;
  name: string;
  spent: number;
  limit: number;
  accent: string;
  icon: string;
  note: string;
};

export const budgetCategories: SmartBudgetCategory[] = [
  {
    id: 'housing',
    name: 'Housing',
    spent: 1150,
    limit: 1300,
    accent: '#1A73E8',
    icon: 'apartment',
    note: 'Mortgage, utilities and repairs',
  },
  {
    id: 'food',
    name: 'Food',
    spent: 460,
    limit: 600,
    accent: '#6A927A',
    icon: 'restaurant',
    note: 'Groceries and dining',
  },
  {
    id: 'transport',
    name: 'Transport',
    spent: 180,
    limit: 280,
    accent: '#B2955A',
    icon: 'directions-car',
    note: 'Fuel, parking and taxi',
  },
  {
    id: 'health',
    name: 'Health',
    spent: 92,
    limit: 180,
    accent: '#B98486',
    icon: 'favorite-outline',
    note: 'Medicine and appointments',
  },
  {
    id: 'fun',
    name: 'Entertainment',
    spent: 210,
    limit: 240,
    accent: '#7C8CF8',
    icon: 'sports-esports',
    note: 'Streaming, games and nights out',
  },
];

export type SmartBudgetReceiptPreset = {
  id: string;
  merchant: string;
  total: number;
  dateLabel: string;
  categoryId: string;
  image: number;
  items: {
    id: string;
    label: string;
    amount: number;
  }[];
};

export const receiptPresets: SmartBudgetReceiptPreset[] = [
  {
    id: 'groceries-march',
    merchant: 'Fresh Basket Market',
    total: 68.45,
    dateLabel: 'March 23, 2026',
    categoryId: 'food',
    image: require('../../../assets/images/loading-budget-photo.png'),
    items: [
      { id: '1', label: 'Groceries', amount: 41.2 },
      { id: '2', label: 'Fruit & snacks', amount: 12.5 },
      { id: '3', label: 'Household essentials', amount: 14.75 },
    ],
  },
  {
    id: 'fuel-weekly',
    merchant: 'City Fuel Station',
    total: 37.9,
    dateLabel: 'March 21, 2026',
    categoryId: 'transport',
    image: require('../../../assets/images/loading-budget-photo.png'),
    items: [{ id: '1', label: 'Fuel refill', amount: 37.9 }],
  },
  {
    id: 'pharmacy-care',
    merchant: 'Wellcare Pharmacy',
    total: 24.3,
    dateLabel: 'March 20, 2026',
    categoryId: 'health',
    image: require('../../../assets/images/loading-budget-photo.png'),
    items: [
      { id: '1', label: 'Medicine', amount: 18.4 },
      { id: '2', label: 'Toiletries', amount: 5.9 },
    ],
  },
  {
    id: 'movie-night',
    merchant: 'Galaxy Cinema',
    total: 29.5,
    dateLabel: 'March 18, 2026',
    categoryId: 'fun',
    image: require('../../../assets/images/loading-budget-photo.png'),
    items: [
      { id: '1', label: 'Tickets', amount: 22.0 },
      { id: '2', label: 'Snacks', amount: 7.5 },
    ],
  },
];

export const budgetInsights = [
  {
    id: 'food',
    title: 'Dining is trending high',
    body: 'Dining out is 14% above your weekly pace. Lowering one meal can recover $68 this month.',
    tone: 'warning',
  },
  {
    id: 'transport',
    title: 'Transport improved',
    body: 'Transport is 11% lower than last month. Keep current pace and reallocate the surplus.',
    tone: 'success',
  },
  {
    id: 'saving',
    title: 'Savings opportunity',
    body: 'You can move $120 from wants into savings and still stay within a healthy budget range.',
    tone: 'primary',
  },
];

export const categoryColorOptions = [
  '#1A73E8',
  '#6A927A',
  '#B2955A',
  '#B98486',
  '#7C8CF8',
  '#FF8C42',
  '#3E9B8F',
  '#E45D93',
];

export const categoryIconOptions = [
  'apartment',
  'restaurant',
  'directions-car',
  'shopping-bag',
  'favorite-outline',
  'school',
  'pets',
  'flight',
] as const;

export const memberInvites = [
  { id: 'you', name: 'You', role: 'Owner', status: 'Full access', accent: '#1A73E8' },
  { id: 'mia', name: 'Mia Tran', role: 'Partner', status: 'Can edit budget', accent: '#6A927A' },
  { id: 'ray', name: 'Ray Nguyen', role: 'Viewer', status: 'Read only', accent: '#B2955A' },
  { id: 'le', name: 'Le Pham', role: 'Pending', status: 'Invite sent', accent: '#B98486' },
];

export type SmartBudgetSetupStep = {
  id: string;
  eyebrow: string;
  title: string;
  body: string;
  options: {
    id: string;
    label: string;
    helper?: string;
  }[];
};

export const smartBudgetSetupSteps: SmartBudgetSetupStep[] = [
  {
    id: 'goal',
    eyebrow: 'Step 1 of 5',
    title: "What's your main budget goal?",
    body: 'We will bias the plan toward the outcome you care about most right now.',
    options: [
      { id: 'save-more', label: 'Save more every month', helper: 'Push more cash into savings.' },
      { id: 'pay-debt', label: 'Pay off debt faster', helper: 'Reduce interest pressure first.' },
      { id: 'stay-organized', label: 'Stay organized', helper: 'Keep every category under control.' },
    ],
  },
  {
    id: 'review',
    eyebrow: 'Step 2 of 5',
    title: 'How often do you want to review the budget?',
    body: 'A tighter review rhythm gives the assistant more chances to correct overspending early.',
    options: [
      { id: 'daily', label: 'Daily check-in', helper: 'Best for strict control.' },
      { id: 'weekly', label: 'Weekly review', helper: 'Balanced and practical.' },
      { id: 'monthly', label: 'Monthly reset', helper: 'Lower effort, lower control.' },
    ],
  },
  {
    id: 'pressure',
    eyebrow: 'Step 3 of 5',
    title: 'Which spending area feels hardest to control?',
    body: 'We will surface this category earlier and set a stricter pace threshold.',
    options: [
      { id: 'food', label: 'Food & dining', helper: 'Meals, groceries and coffee runs.' },
      { id: 'shopping', label: 'Shopping', helper: 'Impulse purchases and lifestyle costs.' },
      { id: 'transport', label: 'Transport', helper: 'Fuel, parking and ride-hailing.' },
    ],
  },
  {
    id: 'cushion',
    eyebrow: 'Step 4 of 5',
    title: 'What level of safety cushion do you want?',
    body: 'This affects how aggressively the planner allocates money to savings versus wants.',
    options: [
      { id: 'tight', label: 'Aggressive', helper: 'Save hard and cut wants quickly.' },
      { id: 'balanced', label: 'Balanced', helper: 'Recommended for most budgets.' },
      { id: 'flexible', label: 'Flexible', helper: 'More room for lifestyle spending.' },
    ],
  },
  {
    id: 'household',
    eyebrow: 'Step 5 of 5',
    title: 'Who is this budget for?',
    body: 'This controls category defaults and whether sharing tools are emphasized.',
    options: [
      { id: 'solo', label: 'Just me', helper: 'Simple personal budget.' },
      { id: 'partner', label: 'Me and my partner', helper: 'Shared planning and invites.' },
      { id: 'family', label: 'Family household', helper: 'More categories and shared access.' },
    ],
  },
];
