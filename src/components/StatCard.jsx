import { formatCompactCurrency, formatCurrency } from '../services/formatters';

function StatCard({ label, value, tone = 'neutral', helper, compact = false }) {
  const displayValue =
    typeof value === 'number'
      ? compact
        ? formatCompactCurrency(value)
        : formatCurrency(value)
      : value;

  return (
    <article className={`stat-card stat-card--${tone}`}>
      <p>{label}</p>
      <h3>{displayValue}</h3>
      {helper ? <span>{helper}</span> : null}
    </article>
  );
}

export default StatCard;
