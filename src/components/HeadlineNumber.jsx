import { getRunwayMonths, getBreakevenMonth } from '../utils/calculations';

export default function HeadlineNumber({ data, monthlyIncome = 0, shortfall = 0 }) {
  if (!data || data.length === 0) return null;

  // Relocation costs exceed savings — show shortfall message before anything else
  if (shortfall > 0) {
    const formatted = '$' + shortfall.toLocaleString('en-AU');
    return (
      <div className="text-center py-6">
        <p className="font-display text-2xl md:text-3xl font-light leading-snug text-red">
          Your relocation costs exceed your savings. You'd need {formatted} more to start with a positive balance.
        </p>
      </div>
    );
  }

  const runway = getRunwayMonths(data);
  const breakeven = getBreakevenMonth(data);
  const balanceNeverZero = data[data.length - 1].balance > 0;

  // Did income never actually appear in the data? (savings ran out before income started)
  const incomeNeverStarted = monthlyIncome > 0 && !data.some((d) => d.income > 0);

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
    if (incomeNeverStarted) {
      text = `Your savings run out in ${runway} months — before your income starts.`;
    } else if (monthlyIncome === 0) {
      text = `Your savings run out in ${runway} months with no income.`;
    } else {
      text = `Your savings run out in ${runway} months.`;
    }
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
