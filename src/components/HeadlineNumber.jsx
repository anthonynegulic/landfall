import { getRunwayMonths, getBreakevenMonth } from '../utils/calculations';

export default function HeadlineNumber({ data }) {
  if (!data || data.length === 0) return null;

  const runway = getRunwayMonths(data);
  const breakeven = getBreakevenMonth(data);
  const balanceNeverZero = data[data.length - 1].balance > 0;

  let text = '';
  let colorClass = '';

  if (breakeven !== null && balanceNeverZero) {
    text = `You break even in month ${breakeven}. After that, you're cash-flow positive.`;
    colorClass = 'text-teal';
  } else if (balanceNeverZero && runway >= 12) {
    text = `You have ${runway}+ months of runway.`;
    colorClass = 'text-teal';
  } else if (runway >= 12) {
    text = `You have ${runway} months of runway.`;
    colorClass = 'text-teal';
  } else if (runway >= 6) {
    text = `You have ${runway} months of runway.`;
    colorClass = 'text-amber';
  } else {
    text = `Your savings run out in ${runway} months with no income.`;
    colorClass = 'text-red';
  }

  return (
    <div className="text-center py-6">
      <p className={`font-display text-2xl md:text-3xl font-light leading-snug ${colorClass}`}>
        {text}
      </p>
    </div>
  );
}
