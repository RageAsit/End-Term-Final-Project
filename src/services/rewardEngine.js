export const EXPENSE_CATEGORIES = [
  'Dining',
  'Fuel',
  'Groceries',
  'Shopping',
  'Travel',
  'Bills',
  'Entertainment',
  'Health',
  'Education',
  'Other',
];

function toNumber(value) {
  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : 0;
}

function roundCurrency(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function getMonthKey(dateInput) {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

function getCategoryRule(card, category) {
  return card.rewardRules?.find((rule) => rule.category === category) || null;
}

export function calculateRewardForAmount({ card, amount, category, currentMonthReward = 0 }) {
  const normalizedAmount = toNumber(amount);
  const defaultRate = toNumber(card?.defaultRewardRate);
  const minimumSpend = toNumber(card?.minimumSpend);
  const capAmount = toNumber(card?.monthlyRewardCap);
  const categoryRule = getCategoryRule(card, category);
  const qualifiesForBonus = minimumSpend === 0 || normalizedAmount >= minimumSpend;
  const bonusRate = categoryRule ? toNumber(categoryRule.rate) : defaultRate;
  const rateUsed = qualifiesForBonus ? bonusRate : defaultRate;
  const rewardBeforeCap = roundCurrency((normalizedAmount * rateUsed) / 100);
  const capRemaining = capAmount > 0 ? Math.max(capAmount - toNumber(currentMonthReward), 0) : null;
  const reward = capRemaining === null ? rewardBeforeCap : Math.min(rewardBeforeCap, capRemaining);
  const appliedRule = categoryRule && qualifiesForBonus ? 'category' : 'fallback';
  const capApplied = capRemaining !== null && rewardBeforeCap > capRemaining;
  const missedBonus = Boolean(categoryRule) && !qualifiesForBonus;

  return {
    reward: roundCurrency(reward),
    rewardBeforeCap,
    rateUsed,
    appliedRule,
    capRemaining: capRemaining === null ? null : roundCurrency(capRemaining),
    capApplied,
    qualifiesForBonus,
    minimumSpend,
    categoryRule,
    defaultRate,
    missedBonus,
  };
}

export function annotateExpensesWithRewards(cards, expenses) {
  const cardLookup = Object.fromEntries(cards.map((card) => [card.id, card]));
  const ledger = {};

  const sortedExpenses = [...expenses].sort((left, right) => {
    const leftTime = new Date(left.date).getTime();
    const rightTime = new Date(right.date).getTime();
    return leftTime - rightTime;
  });

  return sortedExpenses.map((expense) => {
    const card = cardLookup[expense.cardId];
    const monthKey = getMonthKey(expense.date);

    if (!ledger[expense.cardId]) {
      ledger[expense.cardId] = {};
    }

    const currentMonthReward = ledger[expense.cardId][monthKey] || 0;
    const rewardInfo = card
      ? calculateRewardForAmount({
          card,
          amount: expense.amount,
          category: expense.category,
          currentMonthReward,
        })
      : {
          reward: 0,
          rewardBeforeCap: 0,
          rateUsed: 0,
          appliedRule: 'missing-card',
          capRemaining: null,
          capApplied: false,
          qualifiesForBonus: false,
          minimumSpend: 0,
          categoryRule: null,
          defaultRate: 0,
          missedBonus: false,
        };

    ledger[expense.cardId][monthKey] = roundCurrency(currentMonthReward + rewardInfo.reward);

    return {
      ...expense,
      card,
      rewardInfo,
    };
  });
}

export function getCurrentMonthRewardTotals(annotatedExpenses, referenceDate = new Date()) {
  const monthKey = getMonthKey(referenceDate);
  const rewardTotals = {};

  annotatedExpenses.forEach((expense) => {
    if (getMonthKey(expense.date) !== monthKey) {
      return;
    }

    rewardTotals[expense.cardId] = roundCurrency(
      toNumber(rewardTotals[expense.cardId]) + toNumber(expense.rewardInfo?.reward),
    );
  });

  return rewardTotals;
}

export function getRewardExplanation({ card, evaluation }) {
  const explanation = [];

  if (evaluation.categoryRule && evaluation.appliedRule === 'category') {
    explanation.push(`${evaluation.categoryRule.category} bonus at ${evaluation.rateUsed}%`);
  } else if (evaluation.missedBonus) {
    explanation.push(`Bonus unlocked above ${minimumSpendLabel(evaluation.minimumSpend)}`);
  } else {
    explanation.push(`Fallback rate at ${evaluation.rateUsed}%`);
  }

  if (evaluation.capRemaining !== null) {
    explanation.push(`Monthly cap left: ₹${evaluation.capRemaining}`);
  }

  if (evaluation.capApplied) {
    explanation.push(`Cap trims rewards on this swipe`);
  }

  if (!evaluation.reward) {
    explanation.push(`No reward available on this transaction`);
  }

  return explanation;
}

function minimumSpendLabel(value) {
  return `₹${roundCurrency(value)}`;
}

export function rankCardsForTransaction(cards, amount, category, currentMonthRewardTotals) {
  return cards
    .map((card) => {
      const evaluation = calculateRewardForAmount({
        card,
        amount,
        category,
        currentMonthReward: currentMonthRewardTotals[card.id] || 0,
      });

      return {
        card,
        reward: evaluation.reward,
        rewardBeforeCap: evaluation.rewardBeforeCap,
        explanation: getRewardExplanation({ card, evaluation }),
        evaluation,
      };
    })
    .sort((left, right) => right.reward - left.reward || right.evaluation.rateUsed - left.evaluation.rateUsed);
}

export function groupExpensesByMonth(expenses, months = 6) {
  const result = [];
  const currentDate = new Date();

  for (let index = months - 1; index >= 0; index -= 1) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - index, 1);
    const key = getMonthKey(date);
    result.push({
      key,
      label: new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(date),
      amount: 0,
      rewards: 0,
    });
  }

  expenses.forEach((expense) => {
    const target = result.find((item) => item.key === getMonthKey(expense.date));
    if (!target) {
      return;
    }

    target.amount += toNumber(expense.amount);
    target.rewards += toNumber(expense.rewardInfo?.reward);
  });

  return result.map((item) => ({
    ...item,
    amount: roundCurrency(item.amount),
    rewards: roundCurrency(item.rewards),
  }));
}
