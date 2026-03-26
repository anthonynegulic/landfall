import { useState, useEffect, useRef } from 'react';
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

  // ── Derive text and colour ────────────────────────────────────────────────

  // Case 1: relocation costs exceed savings
  if (shortfall > 0) {
    const formatted = '$' + shortfall.toLocaleString('en-AU');
    return (
      <Headline
        text={`Your relocation costs exceed your savings. You'd need ${formatted} more to start with a positive balance.`}
        colorClass="text-red"
      />
    );
  }

  // Case 2: zero savings, zero shortfall (e.g. savings=0 and relocationCosts=0)
  if (data[0].balance === 0 && shortfall === 0) {
    return <Headline text="You're starting with no savings." colorClass="text-amber" />;
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

  return <Headline text={text} colorClass={colorClass} />;
}

// Renders a single headline string with a 200ms opacity fade whenever the text changes.
function Headline({ text, colorClass }) {
  const [opacity, setOpacity] = useState(1);
  const isFirstRender = useRef(true);
  const prevKey = useRef('');
  const timerRef = useRef(null);

  const key = colorClass + '|' + text;

  useEffect(() => {
    // No fade on initial mount
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevKey.current = key;
      return;
    }
    if (prevKey.current === key) return;
    prevKey.current = key;

    clearTimeout(timerRef.current);
    setOpacity(0);
    timerRef.current = setTimeout(() => setOpacity(1), 100);
    return () => clearTimeout(timerRef.current);
  }, [key]);

  return (
    <div className="text-center py-6">
      <p
        className={`font-display font-light leading-snug ${colorClass}`}
        style={{
          fontSize: 'clamp(1.4rem, 3.5vw, 1.8rem)',
          opacity,
          transition: 'opacity 200ms ease',
        }}
      >
        <WithItalicNumber text={text} />
      </p>
    </div>
  );
}
