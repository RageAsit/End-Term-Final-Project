import { useCallback, useEffect, useState } from 'react';
import { EXPENSE_CATEGORIES } from '../services/rewardEngine';
import Modal from './Modal';

function getTodayValue() {
  return new Date().toISOString().slice(0, 10);
}

function buildInitialState(expense, cards) {
  if (!expense) {
    return {
      amount: '',
      category: EXPENSE_CATEGORIES[0],
      date: getTodayValue(),
      cardId: cards[0]?.id || '',
    };
  }

  return {
    amount: String(expense.amount || ''),
    category: expense.category || EXPENSE_CATEGORIES[0],
    date: expense.date || getTodayValue(),
    cardId: expense.cardId || cards[0]?.id || '',
  };
}

function ExpenseForm({ expense, cards, onClose, onSubmit, submitting }) {
  const [formState, setFormState] = useState(buildInitialState(expense, cards));
  const [error, setError] = useState('');

  useEffect(() => {
    setFormState(buildInitialState(expense, cards));
    setError('');
  }, [cards, expense]);

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!Number(formState.amount) || Number(formState.amount) <= 0) {
        setError('Enter a valid amount greater than zero.');
        return;
      }

      if (!formState.cardId) {
        setError('Select the card used for this transaction.');
        return;
      }

      if (!formState.date) {
        setError('Pick a transaction date.');
        return;
      }

      setError('');
      await onSubmit(formState);
    },
    [formState, onSubmit],
  );

  return (
    <Modal
      title={expense ? 'Edit expense' : 'Add expense'}
      description="Track each swipe to unlock accurate reward analytics and recommendations."
      onClose={onClose}
    >
      <form className="form-stack" onSubmit={handleSubmit}>
        <div className="form-grid">
          <label className="field">
            <span>Amount (₹)</span>
            <input
              min="0"
              name="amount"
              step="1"
              value={formState.amount}
              onChange={handleChange}
              type="number"
            />
          </label>

          <label className="field">
            <span>Category</span>
            <select name="category" value={formState.category} onChange={handleChange}>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Date</span>
            <input name="date" value={formState.date} onChange={handleChange} type="date" />
          </label>

          <label className="field">
            <span>Card used</span>
            <select name="cardId" value={formState.cardId} onChange={handleChange}>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="modal-panel__footer">
          <button className="button button--ghost" onClick={onClose} type="button">
            Cancel
          </button>
          <button className="button button--primary" disabled={submitting} type="submit">
            {submitting ? 'Saving...' : expense ? 'Update expense' : 'Save expense'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ExpenseForm;
