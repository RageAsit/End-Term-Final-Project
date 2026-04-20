import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  addCard as addCardRecord,
  addExpense as addExpenseRecord,
  deleteCard as deleteCardRecord,
  deleteExpense as deleteExpenseRecord,
  subscribeToCards,
  subscribeToExpenses,
  updateCard as updateCardRecord,
  updateExpense as updateExpenseRecord,
} from '../services/firestoreService';
import { useAuth } from './AuthContext';

const FinanceContext = createContext(null);

export function FinanceProvider({ children }) {
  const { user, isAuthenticated, isFirebaseConfigured } = useAuth();
  const [cards, setCards] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [financeLoading, setFinanceLoading] = useState(false);
  const [financeError, setFinanceError] = useState('');

  useEffect(() => {
    if (!isAuthenticated || !user || !isFirebaseConfigured) {
      setCards([]);
      setExpenses([]);
      setFinanceLoading(false);
      return undefined;
    }

    setFinanceLoading(true);
    const unsubscribeCards = subscribeToCards(user.uid, (nextCards) => {
      setCards(nextCards);
      setFinanceLoading(false);
    });

    const unsubscribeExpenses = subscribeToExpenses(user.uid, (nextExpenses) => {
      setExpenses(nextExpenses);
      setFinanceLoading(false);
    });

    return () => {
      unsubscribeCards();
      unsubscribeExpenses();
    };
  }, [isAuthenticated, isFirebaseConfigured, user]);

  const addCard = useCallback(
    async (payload) => {
      if (!user) {
        return;
      }

      setFinanceError('');
      await addCardRecord(user.uid, payload);
    },
    [user],
  );

  const updateCard = useCallback(
    async (cardId, payload) => {
      if (!user) {
        return;
      }

      setFinanceError('');
      await updateCardRecord(user.uid, cardId, payload);
    },
    [user],
  );

  const removeCard = useCallback(
    async (cardId) => {
      if (!user) {
        return;
      }

      setFinanceError('');
      await deleteCardRecord(user.uid, cardId);
    },
    [user],
  );

  const addExpense = useCallback(
    async (payload) => {
      if (!user) {
        return;
      }

      setFinanceError('');
      await addExpenseRecord(user.uid, payload);
    },
    [user],
  );

  const updateExpense = useCallback(
    async (expenseId, payload) => {
      if (!user) {
        return;
      }

      setFinanceError('');
      await updateExpenseRecord(user.uid, expenseId, payload);
    },
    [user],
  );

  const removeExpense = useCallback(
    async (expenseId) => {
      if (!user) {
        return;
      }

      setFinanceError('');
      await deleteExpenseRecord(user.uid, expenseId);
    },
    [user],
  );

  const value = useMemo(
    () => ({
      cards,
      expenses,
      financeLoading,
      financeError,
      addCard,
      updateCard,
      removeCard,
      addExpense,
      updateExpense,
      removeExpense,
    }),
    [
      addCard,
      addExpense,
      cards,
      expenses,
      financeError,
      financeLoading,
      removeCard,
      removeExpense,
      updateCard,
      updateExpense,
    ],
  );

  return <FinanceContext.Provider value={value}>{children}</FinanceContext.Provider>;
}

export function useFinance() {
  const context = useContext(FinanceContext);

  if (!context) {
    throw new Error('useFinance must be used within FinanceProvider');
  }

  return context;
}
