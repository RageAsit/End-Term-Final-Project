import { useCallback, useEffect, useMemo, useState } from 'react';
import { EXPENSE_CATEGORIES } from '../services/rewardEngine';
import Modal from './Modal';

function buildInitialState(card) {
  if (!card) {
    return {
      name: '',
      defaultRewardRate: '1',
      monthlyRewardCap: '',
      minimumSpend: '',
      rewardRules: [{ category: 'Dining', rate: '5' }],
    };
  }

  return {
    name: card.name || '',
    defaultRewardRate: String(card.defaultRewardRate ?? 0),
    monthlyRewardCap: card.monthlyRewardCap ? String(card.monthlyRewardCap) : '',
    minimumSpend: card.minimumSpend ? String(card.minimumSpend) : '',
    rewardRules:
      card.rewardRules?.length > 0
        ? card.rewardRules.map((rule) => ({
            category: rule.category,
            rate: String(rule.rate),
          }))
        : [{ category: 'Dining', rate: '5' }],
  };
}

function CardForm({ card, onClose, onSubmit, submitting }) {
  const [formState, setFormState] = useState(buildInitialState(card));
  const [error, setError] = useState('');

  useEffect(() => {
    setFormState(buildInitialState(card));
    setError('');
  }, [card]);

  const selectedCategories = useMemo(
    () => formState.rewardRules.map((rule) => rule.category),
    [formState.rewardRules],
  );

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }, []);

  const handleRuleChange = useCallback((index, field, value) => {
    setFormState((current) => ({
      ...current,
      rewardRules: current.rewardRules.map((rule, ruleIndex) =>
        ruleIndex === index ? { ...rule, [field]: value } : rule,
      ),
    }));
  }, []);

  const addRule = useCallback(() => {
    const availableCategory =
      EXPENSE_CATEGORIES.find((category) => !selectedCategories.includes(category)) || EXPENSE_CATEGORIES[0];

    setFormState((current) => ({
      ...current,
      rewardRules: [...current.rewardRules, { category: availableCategory, rate: '0' }],
    }));
  }, [selectedCategories]);

  const removeRule = useCallback((index) => {
    setFormState((current) => ({
      ...current,
      rewardRules: current.rewardRules.filter((_, ruleIndex) => ruleIndex !== index),
    }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      const duplicateCategory = formState.rewardRules.some(
        (rule, index) =>
          formState.rewardRules.findIndex((item) => item.category === rule.category) !== index,
      );

      if (!formState.name.trim()) {
        setError('Card name is required.');
        return;
      }

      if (Number(formState.defaultRewardRate) < 0) {
        setError('Fallback reward rate cannot be negative.');
        return;
      }

      if (duplicateCategory) {
        setError('Each bonus category can only be added once per card.');
        return;
      }

      const invalidRule = formState.rewardRules.some((rule) => Number(rule.rate) < 0);
      if (invalidRule) {
        setError('Reward rates must be zero or higher.');
        return;
      }

      setError('');
      await onSubmit({
        ...formState,
        rewardRules: formState.rewardRules.filter((rule) => rule.category),
      });
    },
    [formState, onSubmit],
  );

  return (
    <Modal
      title={card ? 'Edit credit card' : 'Add credit card'}
      description="Define reward logic, monthly caps, and minimum spend thresholds."
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Card name</span>
            <input
              name="name"
              value={formState.name}
              onChange={handleChange}
              placeholder="Axis Ace"
              type="text"
            />
          </label>

          <label className="field">
            <span>Fallback reward rate (%)</span>
            <input
              min="0"
              name="defaultRewardRate"
              step="0.1"
              value={formState.defaultRewardRate}
              onChange={handleChange}
              type="number"
            />
          </label>

          <label className="field">
            <span>Monthly reward cap (₹)</span>
            <input
              min="0"
              name="monthlyRewardCap"
              step="1"
              value={formState.monthlyRewardCap}
              onChange={handleChange}
              placeholder="500"
              type="number"
            />
          </label>

          <label className="field">
            <span>Minimum transaction spend for bonus (₹)</span>
            <input
              min="0"
              name="minimumSpend"
              step="1"
              value={formState.minimumSpend}
              onChange={handleChange}
              placeholder="1000"
              type="number"
            />
          </label>
        </div>

        <div className="rules-panel">
          <div className="rules-panel__header">
            <div>
              <h4>Bonus reward rules</h4>
              <p>Assign category-based reward rates that override the fallback rate.</p>
            </div>
            <button className="button button--ghost" onClick={addRule} type="button">
              Add rule
            </button>
          </div>

          <div className="rules-panel__list">
            {formState.rewardRules.map((rule, index) => (
              <div className="rule-row" key={`${rule.category}-${index}`}>
                <label className="field">
                  <span>Category</span>
                  <select
                    value={rule.category}
                    onChange={(event) => handleRuleChange(index, 'category', event.target.value)}
                  >
                    {EXPENSE_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span>Reward rate (%)</span>
                  <input
                    min="0"
                    step="0.1"
                    type="number"
                    value={rule.rate}
                    onChange={(event) => handleRuleChange(index, 'rate', event.target.value)}
                  />
                </label>

                <button
                  className="icon-button icon-button--danger"
                  onClick={() => removeRule(index)}
                  type="button"
                  aria-label={`Remove ${rule.category} rule`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="modal-panel__footer">
          <button className="button button--ghost" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="button button--primary" disabled={submitting} type="submit">
            {submitting ? 'Saving...' : card ? 'Update card' : 'Create card'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default CardForm;
