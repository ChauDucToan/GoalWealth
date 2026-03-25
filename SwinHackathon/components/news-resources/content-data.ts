export type ArticleItem = {
  id: string;
  title: string;
  subtitle: string;
  minutes: string;
  type: 'article';
  category: string;
  author: string;
  excerpt: string;
  body: string[];
};

export type WorkshopItem = {
  id: string;
  title: string;
  subtitle: string;
  minutes: string;
  type: 'video';
  category: string;
  instructor: string;
  schedule: string;
  body: string[];
};

export const articleFeed: ArticleItem[] = [
  {
    id: 'budget-basics',
    title: '5 Easy Ways to Improve Your Monthly Budget',
    subtitle: 'Budgeting fundamentals for busy households',
    minutes: '5 min',
    type: 'article',
    category: 'Budgeting',
    author: 'Mia Tran',
    excerpt: 'A faster way to spot waste, protect savings and keep every category within pace.',
    body: [
      'A healthier monthly budget usually starts with visibility, not restriction. When categories are visible every week, overspending stops feeling surprising and starts feeling fixable.',
      'The first shift is to reduce friction. Give every important category a cap, a note and a simple weekly pace. That keeps the budget readable enough to act on.',
      'The second shift is to protect cash before you optimize wants. Housing, food, transport and emergency savings should be obvious lanes, not hidden inside one general spending bucket.',
    ],
  },
  {
    id: 'investment-trends',
    title: 'Top Investment Trends to Watch in 2026',
    subtitle: 'What patient investors should track this year',
    minutes: '4 min',
    type: 'article',
    category: 'Investing',
    author: 'An Le',
    excerpt: 'Focus on durable habits and portfolio clarity instead of headline chasing.',
    body: [
      'Most retail investors do better when they reduce reaction speed. A strong watchlist, a simple thesis and a fixed review cadence beat constant trading.',
      'The useful trends are the ones that change allocation logic, cash buffers and risk tolerance. They should influence decisions, not just conversations.',
      'If a trend does not improve your time horizon, downside awareness or contribution discipline, it is usually noise.',
    ],
  },
  {
    id: 'refinance-loan',
    title: 'Is Now the Right Time to Refinance Your Loan?',
    subtitle: 'How to compare relief today versus cost tomorrow',
    minutes: '6 min',
    type: 'article',
    category: 'Loans',
    author: 'Ray Nguyen',
    excerpt: 'Refinancing helps only when the new structure actually improves your monthly control.',
    body: [
      'A refinance should be evaluated like any other financial tool: lower total pressure, clearer repayment behavior and better cash flexibility.',
      'The rate matters, but the payment rhythm and fees matter too. Monthly comfort can improve even if the headline rate improvement looks small.',
      'If refinancing only delays pressure without improving the budget shape, it is usually not the right move.',
    ],
  },
];

export const workshopFeed: WorkshopItem[] = [
  {
    id: 'budget-reset',
    title: 'Monthly Budget Reset Workshop',
    subtitle: 'Live budgeting clinic with worksheets',
    minutes: '45 min',
    type: 'video',
    category: 'Workshop',
    instructor: 'Mia Tran',
    schedule: 'Tomorrow • 7:30 PM',
    body: [
      'A live reset session for users who want to rebuild category caps, review recurring charges and clean up month-end overspending.',
      'You will leave with a simpler category structure, a tighter weekly pace and a clear list of what to cut first.',
    ],
  },
  {
    id: 'debt-sprint',
    title: 'Debt Payoff Sprint Planning',
    subtitle: 'Structured session for debt-heavy budgets',
    minutes: '30 min',
    type: 'video',
    category: 'Workshop',
    instructor: 'An Le',
    schedule: 'Friday • 8:00 PM',
    body: [
      'This session helps users sort debt by urgency, pick one payoff rhythm and reduce conflict between debt payments and savings goals.',
      'It is designed for users who already know their balances but need a better operating plan.',
    ],
  },
  {
    id: 'family-budget',
    title: 'Family Budget Alignment Session',
    subtitle: 'Shared finance habits for couples and families',
    minutes: '50 min',
    type: 'video',
    category: 'Workshop',
    instructor: 'Ray Nguyen',
    schedule: 'Saturday • 10:00 AM',
    body: [
      'A collaborative session focused on shared rules, household categories and member roles inside one budget workspace.',
      'Best for couples or families trying to reduce friction around food, utilities and discretionary spending.',
    ],
  },
];

export const contentFeed = articleFeed.map(({ id, title, subtitle, minutes, type }) => ({
  id,
  title,
  subtitle,
  minutes,
  type,
}));
