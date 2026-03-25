import { getRunwayMonths, getBreakevenMonth } from '../utils/calculations';

// Wraps standalone digit sequences (including trailing +) in <em> for italic styling
function WithItalicNumber({ text }) {
  const parts = text.split(/(\d+\+?)/);
  return (
    <>
      {parts.map((part, i) =>
        /^\d+\+?$/.test(part) ? <em key={i}>{part}</em> : part
      )}
    </>
  );
}

export default function HeadlineNumber({ data, monthlyIncome = 0, shortfall = 0 }) {
  if (!data || data.length === 0) return null;

  // Relocation costs exceed savings — show shortfall message before anything else
  if (shortfall > 0) {
    const formatted = '$' + shortfall.toLocaleString('en-AU');
    return (
      <div className="text-center py-6">
        <p
          className="font-display font-light leading-snug text-red"
          style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)' }}
        >
          Your relocation costs exceed your savings. You'd need {formatted} more to start with a positive balance.
        </p>
      </div>
    );
  }

  const runway = getRunwayMonths(data);
  const breakeven = getBreakevenMonth(data);
  const balanceNeverZero = data[data.length - 1].balance > 0;

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
      <p
        className={`font-display font-light leading-snug ${colorClass}`}
        style={{ fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)' }}
      >
        <WithItalicNumber text={text} />
      </p>
    </div>
  );
}
