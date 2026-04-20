import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { auth, firebaseSetupMessage, isFirebaseConfigured } from './firebase';

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

function ensureFirebaseAuth() {
  if (!isFirebaseConfigured || !auth) {
    throw new Error(firebaseSetupMessage);
  }
}

export async function signUpWithEmail({ fullName, email, password }) {
  ensureFirebaseAuth();
  const credentials = await createUserWithEmailAndPassword(auth, email, password);

  if (fullName) {
    await updateProfile(credentials.user, { displayName: fullName });
  }

  return credentials.user;
}

export async function signInWithEmail({ email, password }) {
  ensureFirebaseAuth();
  const credentials = await signInWithEmailAndPassword(auth, email, password);
  return credentials.user;
}

export async function signInWithGoogle() {
  ensureFirebaseAuth();
  const credentials = await signInWithPopup(auth, googleProvider);
  return credentials.user;
}

export async function signOutCurrentUser() {
  ensureFirebaseAuth();
  await signOut(auth);
}
