import { useCallback, useMemo, useState } from 'react';
import { formatCurrency, formatPercent } from '../services/formatters';
import { EXPENSE_CATEGORIES } from '../services/rewardEngine';
import { useRecommendation } from '../hooks/useRecommendation';
import EmptyState from './EmptyState';

function RecommendationEngine({ cards, expenses }) {
  const [scenario, setScenario] = useState({
    amount: '2500',
    category: 'Dining',
  });

  const { bestOption, secondBestOption, rewardSpread, evaluations, ready } = useRecommendation(
    cards,
    expenses,
    scenario.amount,
    scenario.category,
  );

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setScenario((current) => ({ ...current, [name]: value }));
  }, []);

  const comparisonCopy = useMemo(() => {
    if (!bestOption) {
      return 'Add a valid amount to compare your cards.';
    }

    if (!secondBestOption) {
      return 'Only one eligible card is available right now.';
    }

    if (rewardSpread <= 0) {
      return 'Your top cards are effectively tied for this transaction.';
    }

    return `${bestOption.card.name} earns ${formatCurrency(rewardSpread)} more than ${secondBestOption.card.name}.`;
  }, [bestOption, rewardSpread, secondBestOption]);

  if (!cards.length) {
    return (
      <section className="recommendation-card recommendation-card--empty">
        <EmptyState
          compact
          title="Add a card to start optimizing"
          description="Once your credit cards are added, SmartSpend AI will compare them instantly for every purchase."
        />
      </section>
    );
  }

  return (
    <section className="recommendation-card">
      <div className="recommendation-card__header">
        <div>
          <p className="badge badge--glow">Smart recommendation engine</p>
          <h3>Find the best card before you swipe</h3>
          <p className="subtle-copy">
            Enter a transaction scenario and SmartSpend AI applies category rewards, caps, and minimum spend rules in real time.
          </p>
        </div>
      </div>

      <div className="recommendation-card__controls">
        <label className="field field--inline">
          <span>Amount</span>
          <input
            min="0"
            name="amount"
            step="1"
            value={scenario.amount}
            onChange={handleChange}
            type="number"
          />
        </label>

        <label className="field field--inline">
          <span>Category</span>
          <select name="category" value={scenario.category} onChange={handleChange}>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!ready ? (
        <div className="recommendation-card__result recommendation-card__result--empty">
          <h4>Enter an amount to see your best card.</h4>
        </div>
      ) : (
        <div className="recommendation-card__content">
          <div className="recommendation-card__result">
            <p className="recommendation-card__label">Best move</p>
            <h4>
              Use {bestOption?.card.name || 'No eligible card'} to earn {formatCurrency(bestOption?.reward || 0)}
            </h4>
            <p>{comparisonCopy}</p>

            {bestOption ? (
              <div className="recommendation-card__details">
                <div className="recommendation-kpi">
                  <span>Applied rate</span>
                  <strong>{formatPercent(bestOption.evaluation.rateUsed)}</strong>
                </div>
                <div className="recommendation-kpi">
                  <span>Reward before cap</span>
                  <strong>{formatCurrency(bestOption.rewardBeforeCap)}</strong>
                </div>
                <div className="recommendation-kpi">
                  <span>Cap remaining</span>
                  <strong>
                    {bestOption.evaluation.capRemaining === null
                      ? 'Unlimited'
                      : formatCurrency(bestOption.evaluation.capRemaining)}
                  </strong>
                </div>
              </div>
            ) : null}
          </div>

          <div className="recommendation-card__comparison">
            <div className="comparison-header">
              <h4>Reward breakdown</h4>
              <span>{evaluations.length} cards evaluated</span>
            </div>
            <div className="comparison-list">
              {evaluations.map((item, index) => (
                <div className={`comparison-item ${index === 0 ? 'comparison-item--winner' : ''}`} key={item.card.id}>
                  <div>
                    <strong>{item.card.name}</strong>
                    <p>{item.explanation.join(' • ')}</p>
                  </div>
                  <span>{formatCurrency(item.reward)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default RecommendationEngine;
