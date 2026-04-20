import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db, firebaseSetupMessage, isFirebaseConfigured } from './firebase';

function ensureFirestore() {
  if (!isFirebaseConfigured || !db) {
    throw new Error(firebaseSetupMessage);
  }
}

function userDocument(uid) {
  ensureFirestore();
  return doc(db, 'users', uid);
}

function cardsCollection(uid) {
  ensureFirestore();
  return collection(db, 'users', uid, 'cards');
}

function expensesCollection(uid) {
  ensureFirestore();
  return collection(db, 'users', uid, 'expenses');
}

function normalizeRules(rules = []) {
  return rules
    .filter((rule) => rule.category && Number(rule.rate) >= 0)
    .map((rule) => ({
      category: rule.category,
      rate: Number(rule.rate),
    }));
}

function normalizeCardPayload(payload) {
  return {
    name: payload.name.trim(),
    defaultRewardRate: Number(payload.defaultRewardRate) || 0,
    rewardRules: normalizeRules(payload.rewardRules),
    monthlyRewardCap: payload.monthlyRewardCap ? Number(payload.monthlyRewardCap) : 0,
    minimumSpend: payload.minimumSpend ? Number(payload.minimumSpend) : 0,
    updatedAt: serverTimestamp(),
  };
}

function normalizeExpensePayload(payload) {
  return {
    amount: Number(payload.amount) || 0,
    category: payload.category,
    date: payload.date,
    cardId: payload.cardId,
    updatedAt: serverTimestamp(),
  };
}

export async function createUserProfile(uid, profile) {
  const target = userDocument(uid);
  await setDoc(
    target,
    {
      fullName: profile.fullName || '',
      email: profile.email || '',
      updatedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
    },
    { merge: true },
  );
}

export async function getUserProfile(uid) {
  const snapshot = await getDoc(userDocument(uid));
  return snapshot.exists() ? snapshot.data() : null;
}

export function subscribeToCards(uid, callback) {
  const q = query(cardsCollection(uid), orderBy('name'));
  return onSnapshot(q, (snapshot) => {
    const cards = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    callback(cards);
  });
}

export function subscribeToExpenses(uid, callback) {
  const q = query(expensesCollection(uid), orderBy('date', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const expenses = snapshot.docs.map((item) => ({
      id: item.id,
      ...item.data(),
    }));

    callback(expenses);
  });
}

export async function addCard(uid, payload) {
  const collectionRef = cardsCollection(uid);
  await addDoc(collectionRef, {
    ...normalizeCardPayload(payload),
    createdAt: serverTimestamp(),
  });
}

export async function updateCard(uid, cardId, payload) {
  const target = doc(cardsCollection(uid), cardId);
  await updateDoc(target, normalizeCardPayload(payload));
}

export async function deleteCard(uid, cardId) {
  const target = doc(cardsCollection(uid), cardId);
  await deleteDoc(target);
}

export async function addExpense(uid, payload) {
  const collectionRef = expensesCollection(uid);
  await addDoc(collectionRef, {
    ...normalizeExpensePayload(payload),
    createdAt: serverTimestamp(),
  });
}

export async function updateExpense(uid, expenseId, payload) {
  const target = doc(expensesCollection(uid), expenseId);
  await updateDoc(target, normalizeExpensePayload(payload));
}

export async function deleteExpense(uid, expenseId) {
  const target = doc(expensesCollection(uid), expenseId);
  await deleteDoc(target);
}
