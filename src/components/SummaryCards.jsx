import { getRunwayMonths, getBreakevenMonth } from '../utils/calculations';

function Card({ label, value }) {
  return (
    <div className="flex-1 bg-sand rounded-xl px-4 py-4 text-center border border-mist">
      <p className="text-xs font-medium uppercase tracking-widest text-slate mb-1">{label}</p>
      <p className="font-display text-2xl text-ink">{value}</p>
    </div>
  );
}

function formatCurrency(n) {
  return '$' + n.toLocaleString('en-AU');
}

export default function SummaryCards({ data }) {
  if (!data || data.length < 2) return null;

  const monthlyBurn = data[1]?.expenses || 0;
  const runway = getRunwayMonths(data);
  const breakeven = getBreakevenMonth(data);
  const balanceNeverZero = data[data.length - 1].balance > 0;

  const hasIncome = data.some((d) => d.income > 0);
  const runwayDisplay = balanceNeverZero && hasIncome && breakeven ? '∞' : `${runway} mo`;

  return (
    <div className="flex gap-3">
      <Card label="Monthly burn" value={`${formatCurrency(monthlyBurn)}/mo`} />
      <Card label="Runway" value={runwayDisplay} />
      <Card label="Breakeven" value={breakeven ? `Month ${breakeven}` : 'No breakeven'} />
    </div>
  );
}
