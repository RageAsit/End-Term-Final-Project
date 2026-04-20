import { NavLink, Outlet } from 'react-router-dom';
import { useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useFinance } from '../context/FinanceContext';

const navigation = [
  { label: 'Dashboard', to: '/' },
  { label: 'Cards', to: '/cards' },
  { label: 'Expenses', to: '/expenses' },
  { label: 'Analytics', to: '/analytics' },
];

function AppShell() {
  const { user, profile, logout, authError, firebaseSetupMessage, isFirebaseConfigured } = useAuth();
  const { financeError } = useFinance();

  const handleLogout = useCallback(async () => {
    await logout();
  }, [logout]);

  const displayName = profile?.fullName || user?.displayName || user?.email?.split('@')[0] || 'User';
  const initials = displayName
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="app-shell">
      <div className="app-shell__gradient app-shell__gradient--left" />
      <div className="app-shell__gradient app-shell__gradient--right" />

      <header className="app-header">
        <div className="app-header__inner">
          <NavLink className="brand" to="/">
            <div className="brand__mark">
              <span />
            </div>
            <div>
              <p className="brand__eyebrow">Premium Reward Intelligence</p>
              <h1>SmartSpend AI</h1>
            </div>
          </NavLink>

          <nav className="app-nav">
            {navigation.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `app-nav__link ${isActive ? 'app-nav__link--active' : ''}`}
                end={item.to === '/'}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="app-header__actions">
            <div className="user-chip">
              <div className="user-chip__avatar">{initials}</div>
              <div className="user-chip__content">
                <strong>{displayName}</strong>
                <span>{user?.email}</span>
              </div>
            </div>
            <button className="button button--ghost" onClick={handleLogout} type="button">
              Logout
            </button>
          </div>
        </div>

        {!isFirebaseConfigured ? (
          <div className="status-banner status-banner--danger">
            <strong>Setup required.</strong> {firebaseSetupMessage}
          </div>
        ) : null}

        {authError ? (
          <div className="status-banner status-banner--danger">
            <strong>Auth issue.</strong> {authError}
          </div>
        ) : null}

        {financeError ? (
          <div className="status-banner status-banner--danger">
            <strong>Sync issue.</strong> {financeError}
          </div>
        ) : null}
      </header>

      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default AppShell;
