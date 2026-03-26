import { getRunwayMonths, getBreakevenMonth } from '../utils/calculations';

function Card({ label, value, animationDelay }) {
  return (
    <div
      className="bg-sand rounded-xl px-5 py-5 text-center border border-mist card-entrance"
      style={{ animationDelay }}
    >
      <p className="font-body font-medium text-[0.72rem] uppercase tracking-[0.1em] text-slate mb-1">{label}</p>
      <p
        className="font-display font-light text-ink"
        style={{ fontSize: 'clamp(1.4rem, 3vw, 1.8rem)' }}
      >
        {value}
      </p>
    </div>
  );
}

function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU');
}

export default function SummaryCards({ data }) {
  // Require at least 2 data points (month 0 + at least one month)
  if (!data || data.length < 2) return null;

  const monthlyBurn = data[1]?.expenses || 0;
  const runway = getRunwayMonths(data);
  const breakeven = getBreakevenMonth(data);
  const balanceNeverZero = data[data.length - 1].balance > 0;

  const hasIncome = data.some((d) => d.income > 0);
  const runwayDisplay = balanceNeverZero && hasIncome && breakeven ? '∞' : `${runway} mo`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <Card label="Monthly burn" value={`${formatCurrency(monthlyBurn)}/mo`} animationDelay="0ms" />
      <Card label="Runway" value={runwayDisplay} animationDelay="100ms" />
      <Card label="Breakeven" value={breakeven ? `Month ${breakeven}` : 'No breakeven'} animationDelay="200ms" />
    </div>
  );
}
