import { useCallback, useMemo, useState } from 'react';
import CardForm from '../components/CardForm';
import CreditCardTile from '../components/CreditCardTile';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useFinance } from '../context/FinanceContext';
import { useAnalytics } from '../hooks/useAnalytics';

function CardsPage() {
  const { cards, expenses, addCard, updateCard, removeCard } = useFinance();
  const { rewardsByCard } = useAnalytics(cards, expenses);
  const [activeCard, setActiveCard] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');

  const performanceLookup = useMemo(
    () => Object.fromEntries(rewardsByCard.map((item) => [item.cardId, item])),
    [rewardsByCard],
  );

  const handleOpenCreate = useCallback(() => {
    setActiveCard(null);
    setPageError('');
    setIsModalOpen(true);
  }, []);

  const handleEdit = useCallback((card) => {
    setActiveCard(card);
    setPageError('');
    setIsModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setActiveCard(null);
    setPageError('');
    setIsModalOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (payload) => {
      setSubmitting(true);
      setPageError('');

      try {
        if (activeCard) {
          await updateCard(activeCard.id, payload);
        } else {
          await addCard(payload);
        }

        handleClose();
      } catch (error) {
        setPageError(error.message);
      } finally {
        setSubmitting(false);
      }
    },
    [activeCard, addCard, handleClose, updateCard],
  );

  const handleDelete = useCallback(
    async (card) => {
      const linkedExpenses = expenses.filter((expense) => expense.cardId === card.id);

      if (linkedExpenses.length) {
        setPageError(
          `${card.name} is linked to ${linkedExpenses.length} tracked expense(s). Delete or reassign those transactions first.`,
        );
        return;
      }

      const shouldDelete = window.confirm(`Delete ${card.name}? This cannot be undone.`);
      if (!shouldDelete) {
        return;
      }

      try {
        await removeCard(card.id);
        setPageError('');
      } catch (error) {
        setPageError(error.message);
      }
    },
    [expenses, removeCard],
  );

  const averageFallbackRate = useMemo(() => {
    if (!cards.length) {
      return 0;
    }

    return cards.reduce((sum, card) => sum + Number(card.defaultRewardRate || 0), 0) / cards.length;
  }, [cards]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Credit card portfolio"
        title="Model every card exactly the way it works in real life."
        description="Capture fallback reward rates, category boosts, monthly caps, and minimum-spend logic so recommendations stay grounded in reality."
        actions={
          <button className="button button--primary" onClick={handleOpenCreate} type="button">
            Add card
          </button>
        }
      />

      <section className="stats-grid">
        <StatCard label="Saved cards" value={cards.length} tone="primary" />
        <StatCard label="Average fallback rate" value={`${averageFallbackRate.toFixed(1)}%`} tone="accent" />
        <StatCard
          label="Cards with caps"
          value={cards.filter((card) => Number(card.monthlyRewardCap || 0) > 0).length}
          tone="neutral"
        />
      </section>

      {pageError ? <div className="status-banner status-banner--danger">{pageError}</div> : null}

      {cards.length ? (
        <section className="card-grid">
          {cards.map((card) => (
            <CreditCardTile
              key={card.id}
              card={card}
              onDelete={handleDelete}
              onEdit={handleEdit}
              performance={performanceLookup[card.id]}
            />
          ))}
        </section>
      ) : (
        <EmptyState
          title="No cards added yet"
          description="Add your first credit card to start modeling reward rules and unlock smart transaction recommendations."
          actionLabel="Add card"
          onAction={handleOpenCreate}
        />
      )}

      {isModalOpen ? (
        <CardForm
          card={activeCard}
          onClose={handleClose}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      ) : null}
    </div>
  );
}

export default CardsPage;
