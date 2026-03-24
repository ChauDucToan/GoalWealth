import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type FinancialGoalItem = {
  id: string;
  title: string;
  category: string;
  saved: number;
  target: number;
  dueLabel: string;
  icon: React.ComponentProps<typeof MaterialIcons>['name'];
  accent: string;
  monthlyContribution: number;
  note: string;
  milestones: string[];
};

export const financialGoals = [
  {
    id: 'travel',
    title: 'Summer Trip',
    category: 'Lifestyle',
    saved: 1480,
    target: 2400,
    dueLabel: '84 days left',
    icon: 'flight-takeoff',
    accent: '#1573fe',
    monthlyContribution: 320,
    note: 'Paris flights and first week accommodation.',
    milestones: ['Book flights', 'Reserve hotel', 'Build daily spending buffer'],
  },
  {
    id: 'emergency',
    title: 'Emergency Fund',
    category: 'Safety',
    saved: 3200,
    target: 5000,
    dueLabel: 'Build to 6 months',
    icon: 'health-and-safety',
    accent: '#22C55E',
    monthlyContribution: 450,
    note: 'Primary buffer for job and health uncertainty.',
    milestones: ['Reach 4 months', 'Separate emergency wallet', 'Auto-transfer every payday'],
  },
  {
    id: 'home-office',
    title: 'Home Office Upgrade',
    category: 'Work',
    saved: 860,
    target: 1800,
    dueLabel: 'Target by Aug 2026',
    icon: 'desktop-windows',
    accent: '#F59E0B',
    monthlyContribution: 180,
    note: 'Desk, monitor arm and acoustic setup for better focus.',
    milestones: ['Desk fund complete', 'Display setup', 'Final acoustic treatment'],
  },
] as const satisfies readonly FinancialGoalItem[];

export const goalTemplates = [
  { id: 'travel', label: 'Travel', icon: 'flight' as const },
  { id: 'safety', label: 'Safety', icon: 'shield' as const },
  { id: 'debt', label: 'Debt payoff', icon: 'payments' as const },
  { id: 'home', label: 'Home', icon: 'chair' as const },
] as const;

export const targetPresets = [1500, 3000, 5000, 10000] as const;
export const contributionPresets = [100, 250, 400, 600] as const;
