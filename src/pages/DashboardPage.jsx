import { useMemo } from 'react';
import PageHeader from '../components/PageHeader';
import RecommendationEngine from '../components/RecommendationEngine';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import PieChart from '../components/PieChart';
import RecentTransactions from '../components/RecentTransactions';
import EmptyState from '../components/EmptyState';
import { useFinance } from '../context/FinanceContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { formatCurrency } from '../services/formatters';

function DashboardPage() {
  const { cards, expenses } = useFinance();
  const {
    dashboardSummary,
    monthlyTrends,
    categoryBreakdown,
    recentTransactions,
    rewardsByCard,
    monthlyRewards,
  } = useAnalytics(cards, expenses);

  const highlightedCard = useMemo(() => rewardsByCard[0] || null, [rewardsByCard]);

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Decision support dashboard"
        title="Turn every transaction into the best possible reward move."
        description="Monitor spending, compare reward efficiency across cards, and see where your best cashback momentum is coming from this month."
      />

      <section className="hero-grid">
        <div className="hero-panel">
          <div className="hero-panel__copy">
            <span className="badge">Live reward intelligence</span>
            <h3>SmartSpend AI helps you decide before each swipe, not after the statement.</h3>
            <p>
              The engine compares every saved card against the transaction amount and category, then applies fallback rates, bonus rules, and remaining caps to recommend the highest-value choice.
            </p>
          </div>

          <div className="hero-panel__insights">
            <div className="hero-insight">
              <span>Rewards earned this month</span>
              <strong>{formatCurrency(monthlyRewards)}</strong>
            </div>
            <div className="hero-insight">
              <span>Best performing card</span>
              <strong>{highlightedCard?.cardName || 'Add cards to begin'}</strong>
            </div>
          </div>
        </div>

        <RecommendationEngine cards={cards} expenses={expenses} />
      </section>

      <section className="stats-grid">
        {dashboardSummary.map((item) => (
          <StatCard
            key={item.label}
            helper={item.label === 'Top reward card' ? 'Based on rewards earned across all tracked expenses' : undefined}
            label={item.label}
            tone={item.tone}
            value={item.value}
          />
        ))}
      </section>

      <section className="content-grid content-grid--dashboard">
        <div className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Monthly spending</h3>
              <p className="subtle-copy">Last six months of tracked expense volume</p>
            </div>
          </div>
          <BarChart data={monthlyTrends} />
        </div>

        <div className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Category mix</h3>
              <p className="subtle-copy">Current month spend distribution</p>
            </div>
          </div>
          {categoryBreakdown.length ? (
            <PieChart data={categoryBreakdown} />
          ) : (
            <EmptyState
              compact
              title="No category data yet"
              description="Track a few expenses to reveal your spending mix."
            />
          )}
        </div>
      </section>

      <section className="content-grid content-grid--dashboard">
        <RecentTransactions expenses={recentTransactions} />

        <div className="panel-card">
          <div className="panel-card__header">
            <div>
              <h3>Reward leaders</h3>
              <p className="subtle-copy">Which cards are driving the most value</p>
            </div>
          </div>

          {rewardsByCard.length ? (
            <div className="leaderboard-list">
              {rewardsByCard.slice(0, 5).map((entry, index) => (
                <div className="leaderboard-row" key={entry.cardId}>
                  <div className="leaderboard-row__rank">{String(index + 1).padStart(2, '0')}</div>
                  <div>
                    <strong>{entry.cardName}</strong>
                    <p>
                      {formatCurrency(entry.spend)} spend • {entry.transactions} transactions
                    </p>
                  </div>
                  <span>{formatCurrency(entry.rewards)}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              title="No reward leaders yet"
              description="Add cards and log expenses to see card-level performance."
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default DashboardPage;
