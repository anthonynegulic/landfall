import { useState, useMemo } from 'react';
import InputSection from './components/InputSection';
import HeadlineNumber from './components/HeadlineNumber';
import RunwayChart from './components/RunwayChart';
import SummaryCards from './components/SummaryCards';
import { calculateRunway } from './utils/calculations';

const defaultValues = {
  savings: '',
  relocationCosts: 15000,
  monthlyRent: '',
  schoolFees: 0,
  healthInsurance: 500,
  livingExpenses: 3000,
  monthlyIncome: 0,
  monthsUntilIncome: 1,
};

function Nav() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-ink h-[52px] px-6 md:px-10 flex items-center">
      <a href="/" className="font-display text-lg text-white tracking-widest">
        LAND<span className="text-teal">FALL</span>
      </a>
    </nav>
  );
}

function HowItWorks() {
  return (
    <section className="mt-20 md:mt-28 border-t border-mist pt-12 md:pt-16">
      <div className="max-w-3xl mx-auto">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-teal mb-4">How It Works</p>
        <h2 className="font-display text-3xl md:text-4xl font-light text-ink leading-snug mb-6">
          The maths behind <em className="italic text-teal">your runway</em>
        </h2>
        <div className="h-0.5 w-12 bg-teal mb-8"></div>

        <div className="space-y-6 text-[0.95rem] text-slate leading-relaxed">
          <p>
            Landfall answers a single question: <strong className="text-ink font-medium">how long does your money last?</strong> It
            takes your savings, subtracts the one-off cost of actually getting there, then runs the clock forward month by
            month — deducting rent, insurance, school fees, and living expenses as you go.
          </p>
          <p>
            If you've told us you'll have income at your destination, we factor that in too. Once your monthly
            take-home exceeds your monthly outgoings, you've hit <strong className="text-ink font-medium">breakeven</strong> — the
            point where you stop burning savings and start building again. That's the number that matters most.
          </p>

          <div className="bg-sand border border-mist rounded-xl p-6 md:p-8 my-8">
            <p className="font-display text-xl text-ink mb-4">Month by month, here's what happens:</p>
            <ol className="space-y-3 list-decimal list-inside text-[0.9rem]">
              <li>
                <strong className="text-ink font-medium">Arrival (Month 0):</strong> Your savings minus relocation costs. This is your starting balance — the war chest.
              </li>
              <li>
                <strong className="text-ink font-medium">Each month after:</strong> We subtract your total monthly expenses (rent + insurance + school fees + living costs). If income has kicked in, we add that back.
              </li>
              <li>
                <strong className="text-ink font-medium">The chart tracks your balance</strong> until it either hits zero or you reach 36 months — whichever comes first.
              </li>
            </ol>
          </div>

          <p>
            Everything runs in your browser. We don't store your numbers, we don't send them anywhere, and we
            don't ask for your email. This is a calculator, not a funnel.
          </p>
          <p>
            One thing to keep in mind: Landfall models a single, steady scenario. It doesn't account for
            inflation, exchange rate shifts, investment returns, or unexpected costs. Real life has more variables.
            But as a starting point — a clear-eyed look at whether the numbers work — it's the conversation most
            families need to have before anything else.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [values, setValues] = useState(defaultValues);

  const data = useMemo(() => {
    const s = Number(values.savings) || 0;
    const r = Number(values.monthlyRent) || 0;
    if (s <= 0 || r <= 0) return null;

    return calculateRunway({
      savings: s,
      relocationCosts: Number(values.relocationCosts) || 0,
      monthlyRent: r,
      schoolFees: Number(values.schoolFees) || 0,
      healthInsurance: Number(values.healthInsurance) || 0,
      livingExpenses: Number(values.livingExpenses) || 0,
      monthlyIncome: Number(values.monthlyIncome) || 0,
      monthsUntilIncome: values.monthsUntilIncome !== '' ? Number(values.monthsUntilIncome) : 1,
    });
  }, [values]);

  const incomeStartMonth =
    Number(values.monthlyIncome) > 0 ? (values.monthsUntilIncome !== '' ? Number(values.monthsUntilIncome) : 1) + 1 : 0;

  const shortfall = (() => {
    const s = Number(values.savings) || 0;
    const r = Number(values.relocationCosts) || 0;
    return s > 0 ? Math.max(0, r - s) : 0;
  })();

  return (
    <div className="min-h-screen bg-cream">
      <Nav />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-[72px] pb-10 md:pt-[92px] md:pb-16">
        {/* Hero */}
        <header className="text-center mb-10 md:mb-14">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl font-light text-ink leading-tight mb-4">
            Can your family afford to move abroad?
          </h1>
          <p className="font-body text-base md:text-lg text-slate max-w-2xl mx-auto leading-relaxed">
            Enter your savings, costs, and expected income. See exactly how many months of financial runway you have.
          </p>
        </header>

        {/* Main layout */}
        <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-8 md:gap-10 items-start">
          {/* Input form */}
          <div>
            <InputSection values={values} onChange={setValues} />
          </div>

          {/* Output panel */}
          <div>
            {data ? (
              <div className="space-y-6">
                <HeadlineNumber data={data} monthlyIncome={Number(values.monthlyIncome) || 0} shortfall={shortfall} />
                {data.length >= 2 && (
                  <div className="bg-sand rounded-2xl border border-mist p-4 md:p-6">
                    <RunwayChart data={data} incomeStartMonth={incomeStartMonth} />
                  </div>
                )}
                <SummaryCards data={data} />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 bg-sand/50 rounded-2xl border border-mist">
                <p className="text-slate text-center px-6">
                  Enter your savings and monthly rent to see your runway.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <HowItWorks />
      </div>

      {/* Footer */}
      <footer className="bg-ink py-8 px-6 md:px-10">
        <div className="max-w-5xl mx-auto md:flex md:items-center md:justify-between">
          <div className="font-display text-lg text-white tracking-widest mb-4 md:mb-0">
            LAND<span className="text-teal">FALL</span>
          </div>
          <div className="text-[0.75rem] text-white/25 max-w-lg md:text-right leading-relaxed">
            <p className="mb-2">
              Landfall is a planning tool, not financial advice. The numbers here are based entirely on what you
              enter — they don't account for inflation, tax obligations, exchange rate movements, or the
              unexpected. Before making any major financial decision, speak with a qualified financial adviser.
            </p>
            <p>All calculations run locally in your browser. We don't collect or store your data.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
