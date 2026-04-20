import { formatCompactCurrency } from '../services/formatters';

const palette = ['#6366F1', '#10B981', '#F59E0B', '#F43F5E', '#38BDF8', '#A855F7', '#F97316'];

function PieChart({ data, valueKey = 'amount', labelKey = 'category' }) {
  const total = data.reduce((sum, item) => sum + Number(item[valueKey] || 0), 0);

  if (!total) {
    return <p className="subtle-copy">No distribution available yet.</p>;
  }

  let startPercent = 0;
  const segments = data.map((item, index) => {
    const value = Number(item[valueKey] || 0);
    const percent = (value / total) * 100;
    const color = palette[index % palette.length];
    const segment = `${color} ${startPercent}% ${startPercent + percent}%`;
    startPercent += percent;
    return segment;
  });

  return (
    <div className="pie-chart">
      <div
        className="pie-chart__visual"
        style={{ backgroundImage: `conic-gradient(${segments.join(', ')})` }}
      >
        <div className="pie-chart__center">
          <strong>{data.length}</strong>
          <span>Categories</span>
        </div>
      </div>

      <div className="pie-chart__legend">
        {data.map((item, index) => (
          <div className="legend-row" key={`${item[labelKey]}-${index}`}>
            <div className="legend-row__label">
              <span className="legend-dot" style={{ backgroundColor: palette[index % palette.length] }} />
              <strong>{item[labelKey]}</strong>
            </div>
            <span>{formatCompactCurrency(item[valueKey])}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PieChart;
