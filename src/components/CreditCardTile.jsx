import { memo } from 'react';
import { formatCurrency, formatPercent } from '../services/formatters';

const gradients = [
  'linear-gradient(135deg, rgba(99, 102, 241, 0.9), rgba(45, 212, 191, 0.5))',
  'linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(59, 130, 246, 0.45))',
  'linear-gradient(135deg, rgba(244, 114, 182, 0.8), rgba(99, 102, 241, 0.4))',
  'linear-gradient(135deg, rgba(251, 191, 36, 0.8), rgba(244, 63, 94, 0.4))',
];

function getGradient(name) {
  const total = [...name].reduce((sum, character) => sum + character.charCodeAt(0), 0);
  return gradients[total % gradients.length];
}

function CreditCardTile({ card, performance, onEdit, onDelete }) {
  return (
    <article className="credit-card-tile">
      <div className="credit-card-tile__visual" style={{ backgroundImage: getGradient(card.name) }}>
        <div>
          <p>Reward strategy</p>
          <h3>{card.name}</h3>
        </div>
        <span>Default {formatPercent(card.defaultRewardRate)}</span>
      </div>

      <div className="credit-card-tile__content">
        <div className="metric-row">
          <div>
            <span>Lifetime rewards</span>
            <strong>{formatCurrency(performance?.rewards || 0)}</strong>
          </div>
          <div>
            <span>Transactions</span>
            <strong>{performance?.transactions || 0}</strong>
          </div>
        </div>

        <div className="meta-pill-row">
          {card.monthlyRewardCap ? <span className="meta-pill">Cap {formatCurrency(card.monthlyRewardCap)}</span> : null}
          {card.minimumSpend ? <span className="meta-pill">Bonus above {formatCurrency(card.minimumSpend)}</span> : null}
          {!card.monthlyRewardCap && !card.minimumSpend ? <span className="meta-pill">No advanced constraints</span> : null}
        </div>

        <div className="reward-rule-list">
          {card.rewardRules?.length ? (
            card.rewardRules.map((rule) => (
              <div className="reward-rule-list__item" key={`${card.id}-${rule.category}`}>
                <span>{rule.category}</span>
                <strong>{formatPercent(rule.rate)}</strong>
              </div>
            ))
          ) : (
            <p className="subtle-copy">No bonus categories configured. Fallback reward will be used.</p>
          )}
        </div>

        <div className="card-actions">
          <button className="button button--ghost" onClick={() => onEdit(card)} type="button">
            Edit
          </button>
          <button className="button button--danger" onClick={() => onDelete(card)} type="button">
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default memo(CreditCardTile);
