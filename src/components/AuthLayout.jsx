function AuthLayout({ title, subtitle, children, asideTitle, asideCopy, footer }) {
  return (
    <div className="auth-layout">
      <div className="auth-layout__ambient auth-layout__ambient--top" />
      <div className="auth-layout__ambient auth-layout__ambient--bottom" />

      <div className="auth-layout__grid">
        <section className="auth-layout__hero">
          <p className="page-header__eyebrow">Smart reward intelligence</p>
          <h1>{asideTitle}</h1>
          <p>{asideCopy}</p>

          <div className="auth-highlights">
            <div className="auth-highlights__item">
              <strong>Real-time card comparison</strong>
              <span>Choose the best card instantly for every expense.</span>
            </div>
            <div className="auth-highlights__item">
              <strong>Transparent reward math</strong>
              <span>See caps, fallback rates, and reward deltas clearly.</span>
            </div>
            <div className="auth-highlights__item">
              <strong>Premium financial dashboard</strong>
              <span>Track spend, rewards, and category performance in one place.</span>
            </div>
          </div>
        </section>

        <section className="auth-panel">
          <div className="auth-panel__header">
            <h2>{title}</h2>
            <p>{subtitle}</p>
          </div>
          {children}
          {footer ? <div className="auth-panel__footer">{footer}</div> : null}
        </section>
      </div>
    </div>
  );
}

export default AuthLayout;
