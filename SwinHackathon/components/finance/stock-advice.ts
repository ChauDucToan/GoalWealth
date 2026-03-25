import { formatDisplayCurrency, type DisplayCurrency } from '@/components/finance/finance-utils';
import { getGoalsByPriority } from '@/components/financial-goals/data';
import type { StockHolding, StockQuote } from '@/components/home/mock-data';

type StockAdviceInput = {
  stock: StockQuote;
  holding?: StockHolding;
  isWatched: boolean;
  displayCurrency: DisplayCurrency;
  signalText?: string;
};

export type GoalAwareStockAdvice = {
  title: string;
  body: string;
  assistantReply: string;
};

export function getGoalAwareStockAdvice({
  stock,
  holding,
  isWatched,
  displayCurrency,
  signalText,
}: StockAdviceInput): GoalAwareStockAdvice {
  const orderedGoals = getGoalsByPriority();
  const primaryGoal = orderedGoals[0];
  const secondaryGoal = orderedGoals[1];
  const primaryGoalGap = formatDisplayCurrency(primaryGoal.fundingGap, displayCurrency);
  const currentState = holding
    ? 'You already hold this stock, so the question is whether to add more risk.'
    : isWatched
      ? 'This stock is on your watchlist, so the question is whether it deserves capital now.'
      : 'This stock should be judged as a possible fit, not as a default next move.';

  if (primaryGoal.priority === 'High' && primaryGoal.allowedRisk.toLowerCase().includes('low')) {
    const title = holding ? 'Hold while top goals are still underfunded' : 'Wait until core goals are safer';
    const body = `${primaryGoal.goalTitle} still needs ${primaryGoalGap} and is marked ${primaryGoal.allowedRisk}. ${currentState} Right now ${stock.symbol} should stay a review-only name until that goal is more secure.`;
    const assistantReply = `${stock.symbol} is not being treated as a standalone buy idea. ${primaryGoal.goalTitle} is the highest-priority goal and still has a ${primaryGoalGap} gap. Because that goal requires ${primaryGoal.allowedRisk.toLowerCase()} positioning, the better move is to protect it first and only revisit ${stock.symbol} once near-term funding is steadier.${signalText ? ` Current market signal: ${signalText}` : ''}`;

    return { title, body, assistantReply };
  }

  if (secondaryGoal && secondaryGoal.allowedRisk.toLowerCase().includes('low')) {
    const title = holding ? 'Keep sizing aligned with the goal timeline' : 'Only consider a small position';
    const body = `${secondaryGoal.goalTitle} is the next active goal and still needs ${formatDisplayCurrency(secondaryGoal.fundingGap, displayCurrency)}. ${stock.symbol} only fits if it does not slow the monthly plan for that timeline.`;
    const assistantReply = `${stock.symbol} can be discussed, but only in the context of your goal order. ${secondaryGoal.goalTitle} is still drawing monthly funding, so any new position should be small enough that it does not delay the goal plan.${signalText ? ` Current market signal: ${signalText}` : ''}`;

    return { title, body, assistantReply };
  }

  const longTermGoal =
    orderedGoals.find((goal) => goal.allowedRisk.toLowerCase().includes('moderate')) ?? primaryGoal;
  const title = holding ? 'Review as long-term exposure' : 'Possible fit for long-term goals';
  const body = `${longTermGoal.goalTitle} is the goal most compatible with moderate market risk. ${stock.symbol} should be treated as residual long-term exposure after higher-priority funding remains on track.`;
  const assistantReply = `${stock.symbol} is better framed as a long-term allocation candidate tied to ${longTermGoal.goalTitle}, not as a short-term trade. The decision should still respect goal order and monthly funding discipline.${signalText ? ` Current market signal: ${signalText}` : ''}`;

  return { title, body, assistantReply };
}
