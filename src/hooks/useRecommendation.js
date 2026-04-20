import { useMemo } from 'react';
import {
  annotateExpensesWithRewards,
  getCurrentMonthRewardTotals,
  rankCardsForTransaction,
} from '../services/rewardEngine';

export function useRecommendation(cards, expenses, amount, category) {
  return useMemo(() => {
    const numericAmount = Number(amount);

    if (!cards.length || !category || !numericAmount || numericAmount <= 0) {
      return {
        evaluations: [],
        bestOption: null,
        secondBestOption: null,
        rewardSpread: 0,
        ready: false,
      };
    }

    const annotatedExpenses = annotateExpensesWithRewards(cards, expenses);
    const currentMonthRewards = getCurrentMonthRewardTotals(annotatedExpenses);
    const evaluations = rankCardsForTransaction(cards, numericAmount, category, currentMonthRewards);
    const bestOption = evaluations[0] || null;
    const secondBestOption = evaluations[1] || null;
    const rewardSpread = bestOption && secondBestOption ? bestOption.reward - secondBestOption.reward : 0;

    return {
      evaluations,
      bestOption,
      secondBestOption,
      rewardSpread,
      ready: true,
    };
  }, [amount, cards, category, expenses]);
}
