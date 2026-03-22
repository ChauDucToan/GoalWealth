import type { ComponentProps } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type CommunityAuthor = {
  id: string;
  name: string;
  initials: string;
  role: string;
  accent: string;
  verified?: boolean;
  online?: boolean;
};

export type CommunityPollOption = {
  label: string;
  progress: number;
};

export type CommunityPost = {
  id: string;
  author: CommunityAuthor;
  time: string;
  body: string;
  tags: string[];
  likes: string;
  comments: number;
  views: string;
  postType: 'trending' | 'poll' | 'advice';
  category: 'Budgeting' | 'Investing' | 'Opportunity';
  hasPhoto?: boolean;
  photoCaption?: string;
  poll?: {
    title: string;
    totalLabel: string;
    options: CommunityPollOption[];
  };
  isMine?: boolean;
};

export type CommunityNotification = {
  id: string;
  author: CommunityAuthor;
  time: string;
  body: string;
  action: 'comments' | 'message' | 'profile';
  unread?: boolean;
};

export type CommunityComment = {
  id: string;
  author: CommunityAuthor;
  time: string;
  body: string;
  likes: number;
  replies: number;
};

export type CommunityMessage = {
  id: string;
  sender: 'me' | 'other';
  body: string;
  time: string;
};

export type CommunityTag = {
  id: string;
  label: string;
};

export type CommunityComposerAction = {
  id: string;
  icon: ComponentProps<typeof MaterialIcons>['name'];
  label: string;
};

export const communityAuthors: Record<string, CommunityAuthor> = {
  melissa: {
    id: 'melissa',
    name: 'Melissa Watson',
    initials: 'MW',
    role: 'Community Member',
    accent: '#F6B26B',
    verified: true,
  },
  dwyane: {
    id: 'dwyane',
    name: 'Dwyane F. White',
    initials: 'DW',
    role: 'Budget Coach',
    accent: '#8CC152',
    verified: true,
    online: true,
  },
  chalene: {
    id: 'chalene',
    name: 'Chalene Johnson',
    initials: 'CJ',
    role: 'Investing Mentor',
    accent: '#74B9FF',
    verified: true,
  },
  miyuki: {
    id: 'miyuki',
    name: 'Miyuki Harada',
    initials: 'MH',
    role: 'Savings Coach',
    accent: '#9B8AFB',
    verified: true,
  },
  paula: {
    id: 'paula',
    name: 'Paula Iglesias',
    initials: 'PI',
    role: 'Community Member',
    accent: '#6FCF97',
    online: true,
  },
  aileen: {
    id: 'aileen',
    name: 'Aileen Anderson',
    initials: 'AA',
    role: 'Early Investor',
    accent: '#FF8A80',
  },
  leslie: {
    id: 'leslie',
    name: 'Leslie Green',
    initials: 'LG',
    role: 'Budget Buddy',
    accent: '#63C7C0',
  },
};

export const communityIntroPoints = [
  'Ask practical questions about budgeting, debt and saving.',
  'Share progress updates and encourage others on similar journeys.',
  'Discover strategies from verified guides and real community members.',
];

export const communityRules = [
  { id: 'respect', title: 'Respect Others', status: 'warn' as const },
  { id: 'sensitive', title: `Don't Share Sensitive Info`, status: 'error' as const },
  { id: 'toxic', title: `Don't Be Toxic`, status: 'error' as const },
];

export const communityFeedTags: CommunityTag[] = [
  { id: 'trending', label: 'Trending' },
  { id: 'budgeting', label: 'Budgeting' },
  { id: 'investing', label: 'Investing' },
  { id: 'opportunity', label: 'Opportunity' },
];

export const communityComposerTags: CommunityTag[] = [
  { id: 'tips', label: 'tips' },
  { id: 'budgeting', label: 'budgeting' },
  { id: 'opportunity', label: 'opportunity' },
  { id: 'investing', label: 'investing' },
];

export const communityComposerActions: CommunityComposerAction[] = [
  { id: 'image', icon: 'image', label: 'Add photo' },
  { id: 'poll', icon: 'poll', label: 'Add poll' },
  { id: 'tag', icon: 'alternate-email', label: 'Mention' },
  { id: 'emoji', icon: 'sentiment-satisfied-alt', label: 'Mood' },
];

export const communityPosts: CommunityPost[] = [
  {
    id: 'post-1',
    author: communityAuthors.dwyane,
    time: '1h ago',
    body:
      "I've been working hard to get my credit card debt down, and I'm wondering what strategies have worked best for others. How did you stay motivated?",
    tags: ['#budgeting', '#debtfree'],
    likes: '1.2k',
    comments: 276,
    views: '13k',
    postType: 'trending',
    category: 'Budgeting',
    hasPhoto: true,
    photoCaption: 'Piggy bank goal tracker',
  },
  {
    id: 'post-2',
    author: communityAuthors.chalene,
    time: '4h ago',
    body:
      "My FinPal has been helping me invest and save at the same time. What's your favorite budgeting method?",
    tags: ['#budgeting', '#investing'],
    likes: '534',
    comments: 112,
    views: '6.9k',
    postType: 'poll',
    category: 'Budgeting',
    poll: {
      title: 'Favorite Budgeting Methods',
      totalLabel: '93,000 total votes',
      options: [
        { label: 'Zero-based', progress: 0.27 },
        { label: 'Envelope System', progress: 0.19 },
        { label: '50/30/20 Rule', progress: 0.54 },
      ],
    },
    isMine: true,
  },
  {
    id: 'post-3',
    author: communityAuthors.paula,
    time: '2d ago',
    body:
      'My seven year old wanted to save his journey of doing chores and earning money. Thinking about opening a mini allowance tracker for him.',
    tags: ['#saving', '#familygoals'],
    likes: '518',
    comments: 176,
    views: '8.8k',
    postType: 'advice',
    category: 'Opportunity',
    hasPhoto: true,
    photoCaption: 'Planting a savings habit',
  },
];

export const communityNotifications: CommunityNotification[] = [
  {
    id: 'notification-1',
    author: communityAuthors.dwyane,
    time: '5m ago',
    body: 'Someone liked your post. Dwyane White and 3 others reacted.',
    action: 'profile',
    unread: true,
  },
  {
    id: 'notification-2',
    author: communityAuthors.chalene,
    time: '2h ago',
    body: 'A guide shared your post. Melissa saw it and sent a reply.',
    action: 'comments',
    unread: true,
  },
  {
    id: 'notification-3',
    author: communityAuthors.paula,
    time: 'Yesterday',
    body: 'Someone messaged you about your savings goal.',
    action: 'message',
  },
  {
    id: 'notification-4',
    author: communityAuthors.miyuki,
    time: 'Yesterday',
    body: 'Miyuki liked your “budgeting method” poll.',
    action: 'comments',
  },
];

export const communityComments: CommunityComment[] = [
  {
    id: 'comment-1',
    author: communityAuthors.aileen,
    time: '3m ago',
    body:
      'What a beautiful performance with your savings plan. This is exactly why I like seeing progress posts in the community.',
    likes: 188,
    replies: 12,
  },
  {
    id: 'comment-2',
    author: communityAuthors.leslie,
    time: '14m ago',
    body:
      'A slow sprint does work. I moved from weekend cash stuffing to a simple tracker and it finally stuck.',
    likes: 128,
    replies: 8,
  },
  {
    id: 'comment-3',
    author: communityAuthors.melissa,
    time: '19m ago',
    body:
      'Prices are all over the place lately, so seeing real examples from people here helps more than generic advice.',
    likes: 64,
    replies: 4,
  },
];

export const communityMessages: CommunityMessage[] = [
  {
    id: 'message-1',
    sender: 'other',
    body: "Hey Melissa! I saw your post got a bit of traction. Did the 50/30/20 method end up working for you?",
    time: '10:18 AM',
  },
  {
    id: 'message-2',
    sender: 'me',
    body: 'Yes, it helped me stay consistent. I only adjusted the savings slice for my current rent.',
    time: '10:21 AM',
  },
  {
    id: 'message-3',
    sender: 'other',
    body: 'That makes sense. I might try that next month and share a comparison chart in the community.',
    time: '10:24 AM',
  },
];

export const communityStats = [
  { id: 'posts', label: 'Posts', value: '83' },
  { id: 'followers', label: 'Followers', value: '25,000' },
  { id: 'following', label: 'Following', value: '487' },
];

export const communityProfileTabs = ['Posts', 'Videos'] as const;

export const communityProfileHighlights = [
  'Budgeting systems that actually stick',
  'Debt payoff milestones',
  'Family saving challenges',
];

export function getCommunityPost(postId?: string) {
  return communityPosts.find((post) => post.id === postId) ?? communityPosts[1];
}

export function getCommunityAuthor(authorId?: string) {
  return Object.values(communityAuthors).find((author) => author.id === authorId) ?? communityAuthors.melissa;
}
