import { memo } from 'react';
import { formatCurrency, formatDate } from '../services/formatters';
import EmptyState from './EmptyState';

const ExpenseRow = memo(function ExpenseRow({ expense, onEdit, onDelete }) {
  return (
    <tr>
      <td>{formatDate(expense.date)}</td>
      <td>
        <div className="table-stack">
          <strong>{expense.category}</strong>
          <span>{expense.card?.name || 'Deleted card'}</span>
        </div>
      </td>
      <td>{formatCurrency(expense.amount)}</td>
      <td className={expense.rewardInfo?.reward ? 'reward-positive' : 'reward-muted'}>
        {formatCurrency(expense.rewardInfo?.reward || 0)}
      </td>
      <td>
        <div className="table-actions">
          <button className="button button--ghost button--small" onClick={() => onEdit(expense)} type="button">
            Edit
          </button>
          <button className="button button--ghost-danger button--small" onClick={() => onDelete(expense)} type="button">
            Delete
          </button>
        </div>
      </td>
    </tr>
  );
});

function ExpenseTable({ expenses, onEdit, onDelete, onCreate }) {
  if (!expenses.length) {
    return (
      <EmptyState
        title="No expenses tracked yet"
        description="Add your first transaction to unlock reward analytics, trends, and smarter card recommendations."
        actionLabel="Add expense"
        onAction={onCreate}
      />
    );
  }

  return (
    <div className="table-card">
      <table className="data-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Reward earned</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {expenses.map((expense) => (
            <ExpenseRow
              key={expense.id}
              expense={expense}
              onDelete={onDelete}
              onEdit={onEdit}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default ExpenseTable;
