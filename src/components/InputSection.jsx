import { useState, useRef } from 'react';

const SAVINGS_MAX = 10_000_000;
const MONTHLY_MAX = 500_000;
const MONTHS_MAX = 24;

function formatCurrency(val) {
  if (val === '' || val === undefined || val === null) return '';
  const num = Number(val);
  if (isNaN(num)) return '';
  return num.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function CurrencyInput({ id, label, value, onChange, placeholder, disabled, note, max = MONTHLY_MAX }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const displayValue = focused
    ? (value === 0 ? '0' : value || '')
    : formatCurrency(value);

  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="block font-body text-[0.72rem] font-medium uppercase tracking-[0.1em] text-slate mb-1.5"
      >
        {label}
        {note && <span className="normal-case tracking-normal font-normal text-slate/70 ml-1">({note})</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate text-sm select-none">$</span>
        <input
          id={id}
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={disabled ? formatCurrency(value) : displayValue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            // Strip anything that's not a digit
            const raw = e.target.value.replace(/[^0-9]/g, '');
            if (raw === '') return onChange('');
            const num = Math.min(Number(raw), max);
            onChange(num);
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-mist bg-white text-ink text-base font-body font-normal
            focus:outline-none focus:border-teal focus:shadow-[0_0_0_3px_rgba(13,148,136,0.1)]
            disabled:bg-sand/50 disabled:text-slate/50 disabled:cursor-not-allowed
            placeholder:text-[#B4B2A9] placeholder:italic placeholder:font-normal"
        />
      </div>
    </div>
  );
}

function NumberInput({ id, label, value, onChange, note }) {
  return (
    <div className="mb-5">
      <label
        htmlFor={id}
        className="block font-body text-[0.72rem] font-medium uppercase tracking-[0.1em] text-slate mb-1.5"
      >
        {label}
        {note && <span className="normal-case tracking-normal font-normal text-slate/70 ml-1">({note})</span>}
      </label>
      <input
        id={id}
        type="number"
        min="0"
        max={MONTHS_MAX}
        value={value}
        onChange={(e) => {
          const clamped = Math.min(MONTHS_MAX, Math.max(0, Math.floor(Number(e.target.value))));
          onChange(clamped);
        }}
        className="w-full px-3 py-2.5 rounded-lg border border-mist bg-white text-ink text-base font-body font-normal
          focus:outline-none focus:border-teal focus:shadow-[0_0_0_3px_rgba(13,148,136,0.1)]"
      />
    </div>
  );
}

function SchoolFeesInput({ value, onChange, disabled }) {
  const [focused, setFocused] = useState(false);
  const displayValue = disabled
    ? formatCurrency(0)
    : focused
      ? (value === 0 ? '0' : value || '')
      : formatCurrency(value);

  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate text-sm select-none">$</span>
      <input
        id="school-fees"
        type="text"
        inputMode="numeric"
        value={displayValue}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, '');
          if (raw === '') return onChange('');
          const num = Math.min(Number(raw), MONTHLY_MAX);
          onChange(num);
        }}
        disabled={disabled}
        placeholder="Per child, per month"
        className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-mist bg-white text-ink text-base font-body font-normal
          focus:outline-none focus:border-teal focus:shadow-[0_0_0_3px_rgba(13,148,136,0.1)]
          disabled:bg-sand/50 disabled:text-slate/50 disabled:cursor-not-allowed
          placeholder:text-[#B4B2A9] placeholder:italic placeholder:font-normal"
      />
    </div>
  );
}

function Section({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-sand border border-mist rounded-xl overflow-hidden mb-4">
      {/* WAI-ARIA accordion: heading wraps the toggle button */}
      <h2 style={{ margin: 0 }}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          className="w-full flex items-center justify-between px-5 text-left cursor-pointer min-h-[48px] py-3"
        >
          <span className="font-display text-[1.35rem] font-normal text-ink">{title}</span>
          <svg
            className={`w-5 h-5 text-slate transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </h2>
      {/* Smooth height animation */}
      <div
        style={{
          maxHeight: open ? '800px' : '0',
          overflow: 'hidden',
          transition: 'max-height 200ms ease',
        }}
      >
        <div className="px-5 pb-6 pt-1">{children}</div>
      </div>
    </div>
  );
}

export default function InputSection({ values, onChange }) {
  const update = (field) => (val) => onChange({ ...values, [field]: val });
  const [employerCoversSchool, setEmployerCoversSchool] = useState(false);
  const savedSchoolFees = useRef(values.schoolFees);

  return (
    <div>
      <Section title="What you have">
        <CurrencyInput
          id="savings"
          label="Current savings"
          value={values.savings}
          onChange={update('savings')}
          placeholder="Total savings available for the move"
          max={SAVINGS_MAX}
        />
      </Section>

      <Section title="What the move costs">
        <CurrencyInput
          id="relocation-costs"
          label="One-off relocation costs"
          value={values.relocationCosts}
          onChange={update('relocationCosts')}
          placeholder="Flights, shipping, deposits, visa fees"
        />
        <CurrencyInput
          id="monthly-rent"
          label="Monthly rent"
          value={values.monthlyRent}
          onChange={update('monthlyRent')}
          placeholder="Monthly rent at destination"
        />
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="school-fees"
              className="font-body text-[0.72rem] font-medium uppercase tracking-[0.1em] text-slate"
            >
              School fees per month
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <span className="text-[0.72rem] text-slate">Covered by employer?</span>
              <button
                type="button"
                role="switch"
                aria-checked={employerCoversSchool}
                onClick={() => {
                  const next = !employerCoversSchool;
                  setEmployerCoversSchool(next);
                  if (next) {
                    savedSchoolFees.current = values.schoolFees;
                    update('schoolFees')(0);
                  } else {
                    update('schoolFees')(savedSchoolFees.current);
                  }
                }}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors flex-shrink-0
                  ${employerCoversSchool ? 'bg-teal' : 'bg-mist'}`}
              >
                <span
                  className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform
                    ${employerCoversSchool ? 'translate-x-4' : 'translate-x-0.5'}`}
                />
              </button>
            </label>
          </div>
          <SchoolFeesInput
            value={values.schoolFees}
            onChange={update('schoolFees')}
            disabled={employerCoversSchool}
          />
        </div>
        <CurrencyInput
          id="health-insurance"
          label="Health insurance per month"
          value={values.healthInsurance}
          onChange={update('healthInsurance')}
          placeholder="Monthly premium"
        />
        <CurrencyInput
          id="living-expenses"
          label="Monthly living expenses"
          value={values.livingExpenses}
          onChange={update('livingExpenses')}
          placeholder="Everything else — food, transport, utilities, fun"
        />
      </Section>

      <Section title="What you'll earn">
        <CurrencyInput
          id="monthly-income"
          label="Expected monthly income"
          value={values.monthlyIncome}
          onChange={update('monthlyIncome')}
          note="Net take-home, not gross"
          placeholder="Monthly after-tax income"
        />
        {values.monthlyIncome > 0 && (
          <NumberInput
            id="months-until-income"
            label="Months after arrival until first payday"
            value={values.monthsUntilIncome}
            onChange={update('monthsUntilIncome')}
          />
        )}
      </Section>
    </div>
  );
}
