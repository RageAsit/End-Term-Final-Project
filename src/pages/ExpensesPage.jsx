import { useCallback, useMemo, useState } from 'react';
import EmptyState from '../components/EmptyState';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseTable from '../components/ExpenseTable';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { useFinance } from '../context/FinanceContext';
import { useAnalytics } from '../hooks/useAnalytics';

function ExpensesPage() {
  const { cards, expenses, addExpense, updateExpense, removeExpense } = useFinance();
  const { annotatedExpenses } = useAnalytics(cards, expenses);
  const [activeExpense, setActiveExpense] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [pageError, setPageError] = useState('');

  const expenseRows = useMemo(
    () => [...annotatedExpenses].sort((left, right) => new Date(right.date) - new Date(left.date)),
    [annotatedExpenses],
  );

  const currentMonthTransactions = useMemo(() => {
    const now = new Date();
    return expenseRows.filter((expense) => {
      const date = new Date(expense.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    });
  }, [expenseRows]);

  const averageRewardPerTransaction = useMemo(() => {
    if (!expenseRows.length) {
      return 0;
    }

    const total = expenseRows.reduce((sum, expense) => sum + Number(expense.rewardInfo?.reward || 0), 0);
    return total / expenseRows.length;
  }, [expenseRows]);

  const handleOpenCreate = useCallback(() => {
    if (!cards.length) {
      return;
    }

    setActiveExpense(null);
    setPageError('');
    setIsModalOpen(true);
  }, [cards.length]);

  const handleEdit = useCallback((expense) => {
    setActiveExpense(expense);
    setPageError('');
    setIsModalOpen(true);
  }, []);

  const handleClose = useCallback(() => {
    setActiveExpense(null);
    setPageError('');
    setIsModalOpen(false);
  }, []);

  const handleSubmit = useCallback(
    async (payload) => {
      setSubmitting(true);
      setPageError('');

      try {
        if (activeExpense) {
          await updateExpense(activeExpense.id, payload);
        } else {
          await addExpense(payload);
        }

        handleClose();
      } catch (error) {
        setPageError(error.message);
      } finally {
        setSubmitting(false);
      }
    },
    [activeExpense, addExpense, handleClose, updateExpense],
  );

  const handleDelete = useCallback(
    async (expense) => {
      const shouldDelete = window.confirm(`Delete the ${expense.category} expense from ${expense.date}?`);
      if (!shouldDelete) {
        return;
      }

      try {
        await removeExpense(expense.id);
        setPageError('');
      } catch (error) {
        setPageError(error.message);
      }
    },
    [removeExpense],
  );

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Expense tracking"
        title="Log real transactions to keep reward optimization accurate."
        description="Every tracked expense updates monthly caps, card performance, and the recommendation engine so your next swipe is smarter than the last."
        actions={
          <button
            className="button button--primary"
            disabled={!cards.length}
            onClick={handleOpenCreate}
            type="button"
          >
            Add expense
          </button>
        }
      />

      <section className="stats-grid">
        <StatCard label="Tracked expenses" value={expenseRows.length} tone="primary" />
        <StatCard label="This month" value={currentMonthTransactions.length} tone="neutral" />
        <StatCard label="Average reward / txn" value={averageRewardPerTransaction} tone="success" />
      </section>

      {pageError ? <div className="status-banner status-banner--danger">{pageError}</div> : null}

      {!cards.length ? (
        <EmptyState
          title="Add a credit card first"
          description="Expenses need a linked card so SmartSpend AI can calculate rewards correctly."
        />
      ) : (
        <ExpenseTable
          expenses={expenseRows}
          onCreate={handleOpenCreate}
          onDelete={handleDelete}
          onEdit={handleEdit}
        />
      )}

      {isModalOpen ? (
        <ExpenseForm
          cards={cards}
          expense={activeExpense}
          onClose={handleClose}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      ) : null}
    </div>
  );
}

export default ExpensesPage;
