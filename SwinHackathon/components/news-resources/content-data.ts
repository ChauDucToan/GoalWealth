export type ContentItem = {
  id: string;
  title: string;
  subtitle: string;
  minutes: string;
  type: 'article' | 'video';
};

export const contentFeed: ContentItem[] = [
  {
    id: 'c1',
    title: '5 Easy Ways to Improve Your Monthly Budget',
    subtitle: 'Author',
    minutes: '5 min',
    type: 'article',
  },
  {
    id: 'c2',
    title: 'Top Investment Trends to Watch in 2026',
    subtitle: 'Author',
    minutes: '4 min',
    type: 'article',
  },
  {
    id: 'c3',
    title: 'Is Now the Right Time to Refinance Your Loan?',
    subtitle: 'Author',
    minutes: '6 min',
    type: 'article',
  },
];
