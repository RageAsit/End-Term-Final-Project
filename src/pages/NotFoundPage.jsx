import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="panel-card not-found-page__card">
        <p className="page-header__eyebrow">404</p>
        <h2>Page not found</h2>
        <p className="subtle-copy">The page you’re looking for doesn’t exist or may have moved.</p>
        <Link className="button button--primary" to="/">
          Go to dashboard
        </Link>
      </div>
    </div>
  );
}

export default NotFoundPage;
