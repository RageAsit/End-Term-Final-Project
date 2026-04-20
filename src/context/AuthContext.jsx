import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, firebaseSetupMessage, isFirebaseConfigured } from '../services/firebase';
import {
  signInWithEmail,
  signInWithGoogle,
  signOutCurrentUser,
  signUpWithEmail,
} from '../services/authService';
import { createUserProfile, getUserProfile } from '../services/firestoreService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState('');

  const hydrateProfile = useCallback(async (nextUser, fallbackProfile = {}) => {
    let nextProfile = await getUserProfile(nextUser.uid);

    if (!nextProfile) {
      const profilePayload = {
        fullName: fallbackProfile.fullName || nextUser.displayName || '',
        email: fallbackProfile.email || nextUser.email || '',
      };

      await createUserProfile(nextUser.uid, profilePayload);
      nextProfile = await getUserProfile(nextUser.uid);
    }

    return nextProfile;
  }, []);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setAuthLoading(false);
      setAuthError(firebaseSetupMessage);
      return undefined;
    }

    const unsubscribe = onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);

      if (!nextUser) {
        setProfile(null);
        setAuthLoading(false);
        return;
      }

      try {
        const nextProfile = await hydrateProfile(nextUser);
        setProfile(nextProfile);
        setAuthError('');
      } catch (error) {
        setAuthError(error.message);
      } finally {
        setAuthLoading(false);
      }
    });

    return unsubscribe;
  }, [hydrateProfile]);

  const login = useCallback(async (credentials) => {
    setAuthError('');
    const nextUser = await signInWithEmail(credentials);
    const nextProfile = await hydrateProfile(nextUser, {
      email: credentials.email,
    });
    setUser(nextUser);
    setProfile(nextProfile);
    return nextUser;
  }, [hydrateProfile]);

  const signup = useCallback(async (payload) => {
    setAuthError('');
    const nextUser = await signUpWithEmail(payload);
    await createUserProfile(nextUser.uid, {
      fullName: payload.fullName,
      email: payload.email,
    });
    const nextProfile = await hydrateProfile(nextUser, payload);
    setUser(nextUser);
    setProfile(nextProfile);
    return nextUser;
  }, [hydrateProfile]);

  const loginWithGoogle = useCallback(async () => {
    setAuthError('');
    const nextUser = await signInWithGoogle();
    const nextProfile = await hydrateProfile(nextUser);
    setUser(nextUser);
    setProfile(nextProfile);
    return nextUser;
  }, [hydrateProfile]);

  const logout = useCallback(async () => {
    await signOutCurrentUser();
    setUser(null);
    setProfile(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      profile,
      authLoading,
      authError,
      isAuthenticated: Boolean(user),
      login,
      loginWithGoogle,
      signup,
      logout,
      isFirebaseConfigured,
      firebaseSetupMessage,
    }),
    [authError, authLoading, login, loginWithGoogle, logout, profile, signup, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
