import BarChart from '../components/BarChart';
import EmptyState from '../components/EmptyState';
import PageHeader from '../components/PageHeader';
import PieChart from '../components/PieChart';
import StatCard from '../components/StatCard';
import { useFinance } from '../context/FinanceContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency } from '../services/formatters';

function AnalyticsPage() {
  const { cards, expenses } = useFinance();
  const {
    monthlyTrends,
    rewardsByCard,
    rewardByCategory,
    totalRewards,
    totalSpend,
  } = useAnalytics(cards, expenses);

  const highestRewardMonth = monthlyTrends.reduce(
    (best, current) => (current.rewards > best.rewards ? current : best),
    monthlyTrends[0] || { label: 'None', rewards: 0 },
  );

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Reward analytics"
        title="See where your reward strategy is compounding best."
        description="Understand which cards, categories, and months are generating the most value so you can refine your portfolio decisions with confidence."
      />

      <section className="stats-grid">
        <StatCard label="Total spend tracked" value={totalSpend} tone="primary" />
        <StatCard label="Total rewards earned" value={totalRewards} tone="success" />
        <StatCard label="Best reward month" value={highestRewardMonth.label} tone="accent" />
      </section>

      <section className="content-grid">
        <div className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Spending trend</h3>
              <p className="subtle-copy">Monthly spend over the last six months</p>
            </div>
          </div>
          <BarChart data={monthlyTrends} tone="primary" valueKey="amount" />
        </div>

        <div className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Reward trend</h3>
              <p className="subtle-copy">Monthly rewards earned over the last six months</p>
            </div>
          </div>
          <BarChart data={monthlyTrends} tone="success" valueKey="rewards" />
        </div>
      </section>

      <section className="content-grid">
        <div className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Rewards by category</h3>
              <p className="subtle-copy">How your rewards stack across spending behavior</p>
            </div>
          </div>

          {rewardByCategory.length ? (
            <PieChart data={rewardByCategory} labelKey="category" valueKey="rewards" />
          ) : (
            <EmptyState
              compact
              title="No reward data yet"
              description="Add expenses to reveal category-wise reward patterns."
            />
          )}
        </div>

        <div className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Card performance</h3>
              <p className="subtle-copy">Total rewards earned by each card</p>
            </div>
          </div>

          {rewardsByCard.length ? (
            <div className="leaderboard-list">
              {rewardsByCard.map((entry) => (
                <div className="leaderboard-row leaderboard-row--analytics" key={entry.cardId}>
                  <div>
                    <strong>{entry.cardName}</strong>
                    <p>
                      {entry.transactions} transactions • {formatCurrency(entry.spend)} spend
                    </p>
                  </div>
                  <span>{formatCurrency(entry.rewards)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="No card analytics yet"
              description="Save cards and expenses to compare portfolio performance."
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default AnalyticsPage;
