import { formatCompactCurrency } from '../services/formatters';

function BarChart({ data, valueKey = 'amount', labelKey = 'label', tone = 'primary' }) {
  const maxValue = Math.max(...data.map((item) => Number(item[valueKey] || 0)), 1);

  return (
    <div className="bar-chart">
      {data.map((item) => {
        const value = Number(item[valueKey] || 0);
        const height = `${Math.max((value / maxValue) * 100, value ? 10 : 2)}%`;

        return (
          <div className="bar-chart__item" key={`${item[labelKey]}-${valueKey}`}>
            <span className="bar-chart__value">{formatCompactCurrency(value)}</span>
            <div className={`bar-chart__bar bar-chart__bar--${tone}`} style={{ height }} />
            <p>{item[labelKey]}</p>
          </div>
        );
      })}
    </div>
  );
}

export default BarChart;
