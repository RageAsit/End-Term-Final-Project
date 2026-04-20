import { useCallback, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function AuthForm({ mode = 'login' }) {
  const navigate = useNavigate();
  const { login, loginWithGoogle, signup, authError, isFirebaseConfigured, firebaseSetupMessage } =
    useAuth();
  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const isSignup = mode === 'signup';
  const alternateLink = useMemo(
    () =>
      isSignup
        ? {
            to: '/login',
            label: 'Already have an account? Log in',
          }
        : {
            to: '/signup',
            label: 'Create a new account',
          },
    [isSignup],
  );

  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormState((current) => ({ ...current, [name]: value }));
  }, []);

  const handleSubmit = useCallback(
    async (event) => {
      event.preventDefault();

      if (!formState.email || !formState.password) {
        setError('Email and password are required.');
        return;
      }

      if (isSignup && !formState.fullName.trim()) {
        setError('Full name is required for sign up.');
        return;
      }

      setSubmitting(true);
      setError('');

      try {
        if (isSignup) {
          await signup(formState);
        } else {
          await login(formState);
        }

        navigate('/');
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setSubmitting(false);
      }
    },
    [formState, isSignup, login, navigate, signup],
  );

  const handleGoogleLogin = useCallback(async () => {
    setSubmitting(true);
    setError('');

    try {
      await loginWithGoogle();
      navigate('/');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }, [loginWithGoogle, navigate]);

  return (
    <form className="form-stack" onSubmit={handleSubmit}>
      {!isFirebaseConfigured ? (
        <div className="status-banner status-banner--danger">
          <strong>Firebase setup required.</strong> {firebaseSetupMessage}
        </div>
      ) : null}

      {isSignup ? (
        <label className="field">
          <span>Full name</span>
          <input
            name="fullName"
            value={formState.fullName}
            onChange={handleChange}
            placeholder="Aarav Mehta"
            type="text"
          />
        </label>
      ) : null}

      <label className="field">
        <span>Email address</span>
        <input
          autoComplete="email"
          name="email"
          value={formState.email}
          onChange={handleChange}
          placeholder="you@example.com"
          type="email"
        />
      </label>

      <label className="field">
        <span>Password</span>
        <input
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          name="password"
          value={formState.password}
          onChange={handleChange}
          placeholder="••••••••"
          type="password"
        />
      </label>

      {error || authError ? <p className="form-error">{error || authError}</p> : null}

      <button className="button button--primary button--block" disabled={submitting} type="submit">
        {submitting ? 'Please wait...' : isSignup ? 'Create account' : 'Log in'}
      </button>

      <div className="auth-divider">
        <span>or continue with</span>
      </div>

      <button
        className="button button--google button--block"
        disabled={submitting || !isFirebaseConfigured}
        onClick={handleGoogleLogin}
        type="button"
      >
        <span className="button__google-mark" aria-hidden="true">
          G
        </span>
        Google
      </button>

      <Link className="inline-link" to={alternateLink.to}>
        {alternateLink.label}
      </Link>
    </form>
  );
}

export default AuthForm;
