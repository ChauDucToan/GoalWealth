import type React from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type AssistantIconName = React.ComponentProps<typeof MaterialIcons>['name'];

export type AssistantRole = 'assistant' | 'user';

export type AssistantCard =
  | {
      type: 'budget';
      spent: number;
      savings: number;
      rent: number;
      food: number;
      transport: number;
    }
  | {
      type: 'subscriptions';
      monthLabel: string;
      total: number;
      items: { name: string; amount: number; status?: string }[];
      cancelled?: string;
    }
  | {
      type: 'actions';
      title: string;
      actions: string[];
    }
  | {
      type: 'calendar';
      monthLabel: string;
      highlightedDate: number;
      footer: string;
    }
  | {
      type: 'confirmation';
      title: string;
      summary: string;
      statusLabel: string;
    }
  | {
      type: 'transaction';
      title: string;
      fields: { label: string; value: string }[];
    }
  | {
      type: 'quote';
      title: string;
      body: string;
      author?: string;
    }
  | {
      type: 'bar-chart';
      title: string;
      labels: string[];
      values: number[];
    }
  | {
      type: 'projection';
      title: string;
      labels: string[];
      values: number[];
      targetLabel: string;
    }
  | {
      type: 'resource';
      title: string;
      caption: string;
      source: string;
    }
  | {
      type: 'map';
      title: string;
      detail: string;
      eta: string;
    }
  | {
      type: 'receipt';
      title: string;
      fileName: string;
      fields: { label: string; value: string }[];
    };

export type AssistantMessage = {
  id: string;
  role: AssistantRole;
  text?: string;
  meta?: string;
  card?: AssistantCard;
};

export type AssistantScenario = {
  id: string;
  title: string;
  chipLabel: string;
  icon: AssistantIconName;
  prompt: string;
  accent: string;
  messages: AssistantMessage[];
};

export type AssistantIntroSlide = {
  id: string;
  title: string;
  body: string;
  buttonLabel: string;
  icon: AssistantIconName;
};

export const assistantIntroSlides: AssistantIntroSlide[] = [
  {
    id: 'intro-1',
    title: 'Meet Your Personal Finance Assistant',
    body: 'Ask for budget help, spending reviews, reminders and transaction explanations in one place.',
    buttonLabel: 'Get Started',
    icon: 'smart-toy',
  },
  {
    id: 'intro-2',
    title: 'Precautions & Limitations',
    body: 'Finpal gives suggestions, not licensed financial advice. Always double-check important decisions.',
    buttonLabel: "Understood. Let's chat",
    icon: 'shield',
  },
];

const overviewMessages: AssistantMessage[] = [
  {
    id: 'overview-user',
    role: 'user',
    text: 'Can you review my budget health for this month?',
    meta: '9:41 AM',
  },
  {
    id: 'overview-assistant-1',
    role: 'assistant',
    text: 'You are on track overall. Food is a bit high, but savings and rent remain within the safe range.',
    meta: '9:42 AM',
  },
  {
    id: 'overview-card',
    role: 'assistant',
    card: {
      type: 'budget',
      spent: 4000,
      savings: 1000,
      rent: 2200,
      food: 640,
      transport: 310,
    },
  },
  {
    id: 'overview-actions',
    role: 'assistant',
    card: {
      type: 'actions',
      title: 'Suggested next steps',
      actions: [
        'Review food budget',
        'Set spending limit',
        'Get saving tips',
        'Find ways to save',
      ],
    },
  },
];

export const assistantScenarios: AssistantScenario[] = [
  {
    id: 'overview',
    title: 'Budget Overview',
    chipLabel: 'Budget',
    icon: 'donut-large',
    prompt: 'How is my budget this month?',
    accent: '#1573fe',
    messages: overviewMessages,
  },
  {
    id: 'subscriptions',
    title: 'Subscription Audit',
    chipLabel: 'Subscriptions',
    icon: 'subscriptions',
    prompt: 'Please check my recurring subscriptions and cancel unused ones.',
    accent: '#22C55E',
    messages: [
      {
        id: 'subs-user',
        role: 'user',
        text: 'Please help take action on my subscriptions.',
        meta: '10:24 AM',
      },
      {
        id: 'subs-assistant',
        role: 'assistant',
        text: 'I reviewed your recent subscription charges and found one low-value plan that can be cancelled.',
        meta: '10:24 AM',
      },
      {
        id: 'subs-card',
        role: 'assistant',
        card: {
          type: 'subscriptions',
          monthLabel: 'January',
          total: 199,
          items: [
            { name: 'Netflix, Inc', amount: 15, status: 'Keep' },
            { name: 'FoxtelGo Coffee', amount: 5, status: 'Optional' },
            { name: 'TeslaCharging', amount: 99, status: 'Active' },
          ],
          cancelled: 'Entertainment bundle cancelled',
        },
      },
    ],
  },
  {
    id: 'reminder',
    title: 'Vacation Reminder',
    chipLabel: 'Reminder',
    icon: 'event',
    prompt: 'Remind me one week before my vacation fund payment is due.',
    accent: '#F59E0B',
    messages: [
      {
        id: 'rem-user',
        role: 'user',
        text: 'Schedule a reminder for my vacation fund transfer.',
        meta: '8:52 AM',
      },
      {
        id: 'rem-card',
        role: 'assistant',
        card: {
          type: 'calendar',
          monthLabel: 'January 2026',
          highlightedDate: 9,
          footer: 'Reminder set for vacation goal',
        },
      },
    ],
  },
  {
    id: 'recurring',
    title: 'Recurring Payment',
    chipLabel: 'Recurring',
    icon: 'event-repeat',
    prompt: 'Stop my monthly recurring transfer for now.',
    accent: '#1573fe',
    messages: [
      {
        id: 'rec-user',
        role: 'user',
        text: 'Can you stop the recurring transfer temporarily?',
        meta: '11:22 AM',
      },
      {
        id: 'rec-card',
        role: 'assistant',
        card: {
          type: 'confirmation',
          title: 'Recurring Payment Successfully Stopped',
          summary: 'The transfer was removed from future schedules and no payment will be sent next month.',
          statusLabel: 'Completed',
        },
      },
    ],
  },
  {
    id: 'categorize',
    title: 'Auto Categorize',
    chipLabel: 'Categorize',
    icon: 'category',
    prompt: 'Please categorize my latest purchase.',
    accent: '#8B5CF6',
    messages: [
      {
        id: 'cat-user',
        role: 'user',
        text: 'Please assign a category for my latest card swipe.',
        meta: '1:04 PM',
      },
      {
        id: 'cat-card',
        role: 'assistant',
        card: {
          type: 'actions',
          title: 'Suggested category',
          actions: ['Bills', 'Grocery', 'Dining', 'Transport', 'Other'],
        },
      },
      {
        id: 'cat-result',
        role: 'assistant',
        text: 'Done. I labeled the transaction as Food based on the merchant and amount.',
        meta: '1:05 PM',
      },
    ],
  },
  {
    id: 'transfer',
    title: 'Transfer Summary',
    chipLabel: 'Transfer',
    icon: 'north-east',
    prompt: 'Summarize my latest transfer.',
    accent: '#0EA5E9',
    messages: [
      {
        id: 'tr-user',
        role: 'user',
        text: 'Please summarize the last transfer I made.',
        meta: '2:16 PM',
      },
      {
        id: 'tr-card',
        role: 'assistant',
        card: {
          type: 'transaction',
          title: 'Wire transfer summary',
          fields: [
            { label: 'Amount', value: '$60' },
            { label: 'Category', value: 'Giving Out' },
            { label: 'Date', value: 'Today' },
            { label: 'Network', value: 'AslanF Store' },
          ],
        },
      },
      {
        id: 'tr-result',
        role: 'assistant',
        card: {
          type: 'confirmation',
          title: 'Transfer completed',
          summary: 'The transfer cleared successfully and is now visible in your ledger.',
          statusLabel: 'Success',
        },
      },
    ],
  },
  {
    id: 'inspiration',
    title: 'Daily Inspiration',
    chipLabel: 'Quote',
    icon: 'wb-sunny',
    prompt: 'Give me today’s financial inspiration.',
    accent: '#FACC15',
    messages: [
      {
        id: 'quote-card',
        role: 'assistant',
        card: {
          type: 'quote',
          title: 'Daily quote',
          body: 'Small investments, if invested wisely, play the best friend of your future self.',
          author: 'Finpal',
        },
      },
    ],
  },
  {
    id: 'spending-pattern',
    title: 'Spending Pattern',
    chipLabel: 'Spending',
    icon: 'bar-chart',
    prompt: 'Analyze my daily spending pattern.',
    accent: '#EF4444',
    messages: [
      {
        id: 'bar-user',
        role: 'user',
        text: 'Can you tell me where my spending spiked this week?',
        meta: '4:10 PM',
      },
      {
        id: 'bar-card',
        role: 'assistant',
        card: {
          type: 'bar-chart',
          title: 'Weekly spending pattern',
          labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          values: [36, 82, 40, 94, 61],
        },
      },
    ],
  },
  {
    id: 'projection',
    title: 'Budget Projection',
    chipLabel: 'Forecast',
    icon: 'trending-up',
    prompt: 'Show my next 6-month budget projection.',
    accent: '#22C55E',
    messages: [
      {
        id: 'proj-user',
        role: 'user',
        text: 'Can you predict my budget trend using past transactions?',
        meta: '5:03 PM',
      },
      {
        id: 'proj-card',
        role: 'assistant',
        card: {
          type: 'projection',
          title: 'Budget projection',
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          values: [61, 62, 60, 58, 64, 69],
          targetLabel: 'Goal: $800 monthly buffer',
        },
      },
    ],
  },
  {
    id: 'resources',
    title: 'Resources',
    chipLabel: 'Resources',
    icon: 'menu-book',
    prompt: 'Recommend articles or videos to improve my budgeting.',
    accent: '#1573fe',
    messages: [
      {
        id: 'resource-user',
        role: 'user',
        text: 'Recommend something practical I can read or watch today.',
        meta: '6:18 PM',
      },
      {
        id: 'resource-card',
        role: 'assistant',
        card: {
          type: 'resource',
          title: '3 videos to master your cash flow and budgeting',
          caption: 'Short-form picks matched to your spending habits',
          source: 'Finpal Academy',
        },
      },
    ],
  },
  {
    id: 'nearby',
    title: 'Nearby Services',
    chipLabel: 'Nearby',
    icon: 'place',
    prompt: 'Show financial services near my location.',
    accent: '#0EA5E9',
    messages: [
      {
        id: 'near-user',
        role: 'user',
        text: 'Can you show nearby bank branches that close late?',
        meta: '7:05 PM',
      },
      {
        id: 'near-card',
        role: 'assistant',
        card: {
          type: 'map',
          title: 'Nearby services',
          detail: 'Chase Bank, 15 Market St, open until 8PM',
          eta: '6 min walk',
        },
      },
    ],
  },
  {
    id: 'receipt',
    title: 'Receipt OCR',
    chipLabel: 'Receipt',
    icon: 'receipt-long',
    prompt: 'Scan this receipt and summarize it.',
    accent: '#EF4444',
    messages: [
      {
        id: 'receipt-uploaded',
        role: 'user',
        text: 'I uploaded a grocery receipt. Can you extract the useful parts?',
        meta: '8:24 PM',
      },
      {
        id: 'receipt-card',
        role: 'assistant',
        card: {
          type: 'receipt',
          title: 'Receipt summary',
          fileName: 'receipt_jan23.jpg',
          fields: [
            { label: 'Merchant', value: 'FreshMart Grocery' },
            { label: 'Category', value: 'Food & Groceries' },
            { label: 'Total', value: '$88.00' },
            { label: 'Date', value: 'Sep 23' },
          ],
        },
      },
    ],
  },
];

export const defaultAssistantScenarioId = 'overview';

export const assistantQuickActions = [
  { id: 'voice', label: 'Voice', icon: 'keyboard-voice' as AssistantIconName },
  { id: 'receipt', label: 'Scan Receipt', icon: 'photo-camera' as AssistantIconName },
  { id: 'settings', label: 'Settings', icon: 'tune' as AssistantIconName },
  { id: 'upgrade', label: 'Upgrade', icon: 'workspace-premium' as AssistantIconName },
];

export const assistantPlans = [
  {
    id: 'free',
    name: 'Free Plan',
    price: '$0 USD',
    caption: 'Basic features and functionality',
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    price: '$9.99 USD',
    caption: 'Budgeting premium voice & more',
  },
];
