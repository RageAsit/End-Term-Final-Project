import { useMemo } from 'react';
import { formatMonthLabel } from '../services/formatters';
import { annotateExpensesWithRewards, groupExpensesByMonth } from '../services/rewardEngine';

function getCurrentMonthKey() {
  const currentDate = new Date();
  return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
}

export function useAnalytics(cards, expenses) {
  return useMemo(() => {
    const annotatedExpenses = annotateExpensesWithRewards(cards, expenses);
    const currentMonthKey = getCurrentMonthKey();
    const recentTransactions = [...annotatedExpenses]
      .sort((left, right) => new Date(right.date) - new Date(left.date))
      .slice(0, 6);

    const currentMonthExpenses = annotatedExpenses.filter((expense) => {
      const date = new Date(expense.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return monthKey === currentMonthKey;
    });

    const monthlySpend = currentMonthExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);
    const monthlyRewards = currentMonthExpenses.reduce(
      (sum, expense) => sum + Number(expense.rewardInfo?.reward || 0),
      0,
    );
    const totalRewards = annotatedExpenses.reduce(
      (sum, expense) => sum + Number(expense.rewardInfo?.reward || 0),
      0,
    );
    const totalSpend = annotatedExpenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0);

    const categoryBreakdownMap = currentMonthExpenses.reduce((accumulator, expense) => {
      const currentAmount = accumulator[expense.category] || 0;
      accumulator[expense.category] = currentAmount + Number(expense.amount || 0);
      return accumulator;
    }, {});

    const categoryBreakdown = Object.entries(categoryBreakdownMap)
      .map(([category, amount]) => ({ category, amount }))
      .sort((left, right) => right.amount - left.amount);

    const rewardByCardMap = cards.reduce((accumulator, card) => {
      accumulator[card.id] = {
        cardId: card.id,
        cardName: card.name,
        rewards: 0,
        spend: 0,
        transactions: 0,
      };
      return accumulator;
    }, {});

    annotatedExpenses.forEach((expense) => {
      if (!rewardByCardMap[expense.cardId]) {
        return;
      }

      rewardByCardMap[expense.cardId].rewards += Number(expense.rewardInfo?.reward || 0);
      rewardByCardMap[expense.cardId].spend += Number(expense.amount || 0);
      rewardByCardMap[expense.cardId].transactions += 1;
    });

    const rewardsByCard = Object.values(rewardByCardMap).sort((left, right) => right.rewards - left.rewards);
    const monthlySeries = groupExpensesByMonth(annotatedExpenses, 6);

    const topRewardCard = rewardsByCard[0] || null;
    const dashboardSummary = [
      {
        label: 'Monthly spend',
        value: monthlySpend,
        tone: 'primary',
      },
      {
        label: 'Rewards earned',
        value: monthlyRewards,
        tone: 'success',
      },
      {
        label: 'Active cards',
        value: cards.length,
        tone: 'neutral',
      },
      {
        label: 'Top reward card',
        value: topRewardCard?.cardName || 'None yet',
        tone: 'accent',
      },
    ];

    const rewardCategoryBreakdownMap = annotatedExpenses.reduce((accumulator, expense) => {
      const currentAmount = accumulator[expense.category] || 0;
      accumulator[expense.category] = currentAmount + Number(expense.rewardInfo?.reward || 0);
      return accumulator;
    }, {});

    const rewardByCategory = Object.entries(rewardCategoryBreakdownMap)
      .map(([category, rewards]) => ({ category, rewards }))
      .sort((left, right) => right.rewards - left.rewards);

    const monthlyTrends = monthlySeries.map((item) => ({
      ...item,
      label: formatMonthLabel(new Date(`${item.key}-01`)),
    }));

    return {
      annotatedExpenses,
      recentTransactions,
      currentMonthExpenses,
      monthlySpend,
      monthlyRewards,
      totalRewards,
      totalSpend,
      categoryBreakdown,
      rewardsByCard,
      rewardByCategory,
      monthlyTrends,
      dashboardSummary,
    };
  }, [cards, expenses]);
}
