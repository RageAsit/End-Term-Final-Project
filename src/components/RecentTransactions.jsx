import { formatCurrency, formatDate } from '../services/formatters';
import EmptyState from './EmptyState';

function RecentTransactions({ expenses }) {
  if (!expenses.length) {
    return (
      <div className="panel-card">
        <EmptyState
          compact
          title="No recent transactions"
          description="Track expenses to see your latest swipes and rewards earned."
        />
      </div>
    );
  }

  return (
    <div className="panel-card">
      <div className="panel-card__header">
        <div>
          <h3>Recent transactions</h3>
          <p className="subtle-copy">Latest activity and reward outcome</p>
        </div>
      </div>

      <div className="transaction-list">
        {expenses.map((expense) => (
          <div className="transaction-row" key={expense.id}>
            <div className="transaction-row__identity">
              <div className="transaction-row__badge">{expense.category.slice(0, 1)}</div>
              <div>
                <strong>{expense.category}</strong>
                <p>
                  {expense.card?.name || 'Deleted card'} • {formatDate(expense.date)}
                </p>
              </div>
            </div>
            <div className="transaction-row__numbers">
              <strong>{formatCurrency(expense.amount)}</strong>
              <span>{formatCurrency(expense.rewardInfo?.reward || 0)} reward</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentTransactions;
