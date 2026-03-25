import { useState, useRef } from 'react';

function formatCurrency(val) {
  if (val === '' || val === undefined || val === null) return '';
  const num = Number(val);
  if (isNaN(num)) return '';
  return num.toLocaleString('en-AU', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function CurrencyInput({ label, value, onChange, placeholder, disabled, note }) {
  const [focused, setFocused] = useState(false);
  const inputRef = useRef(null);

  const displayValue = focused
    ? (value === 0 ? '0' : value || '')
    : formatCurrency(value);

  return (
    <div className="mb-4">
      <label className="block font-body text-xs font-medium uppercase tracking-widest text-slate mb-1.5">
        {label}
        {note && <span className="normal-case tracking-normal font-normal text-slate/70 ml-1">({note})</span>}
      </label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate text-sm">$</span>
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          value={disabled ? formatCurrency(value) : displayValue}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={(e) => {
            const raw = e.target.value.replace(/[^0-9]/g, '');
            onChange(raw === '' ? '' : Number(raw));
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-mist bg-white text-ink text-sm
            focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal
            disabled:bg-sand/50 disabled:text-slate/50 disabled:cursor-not-allowed
            placeholder:text-slate/40"
        />
      </div>
    </div>
  );
}

function NumberInput({ label, value, onChange, note }) {
  return (
    <div className="mb-4">
      <label className="block font-body text-xs font-medium uppercase tracking-widest text-slate mb-1.5">
        {label}
        {note && <span className="normal-case tracking-normal font-normal text-slate/70 ml-1">({note})</span>}
      </label>
      <input
        type="number"
        min="0"
        max="36"
        value={value}
        onChange={(e) => onChange(Math.max(0, Number(e.target.value)))}
        className="w-full px-3 py-2.5 rounded-lg border border-mist bg-white text-ink text-sm
          focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal"
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
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate text-sm">$</span>
      <input
        type="text"
        inputMode="numeric"
        value={displayValue}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          const raw = e.target.value.replace(/[^0-9]/g, '');
          onChange(raw === '' ? '' : Number(raw));
        }}
        disabled={disabled}
        placeholder="Per child, per month"
        className="w-full pl-7 pr-3 py-2.5 rounded-lg border border-mist bg-white text-ink text-sm
          focus:outline-none focus:ring-2 focus:ring-teal/30 focus:border-teal
          disabled:bg-sand/50 disabled:text-slate/50 disabled:cursor-not-allowed
          placeholder:text-slate/40"
      />
    </div>
  );
}

function Section({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border border-mist rounded-xl overflow-hidden mb-4">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-sand/50 text-left cursor-pointer"
      >
        <span className="font-display text-xl text-ink">{title}</span>
        <svg
          className={`w-5 h-5 text-slate transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="px-5 py-4">{children}</div>}
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
          label="Current savings"
          value={values.savings}
          onChange={update('savings')}
          placeholder="Total savings available for the move"
        />
      </Section>

      <Section title="What the move costs">
        <CurrencyInput
          label="One-off relocation costs"
          value={values.relocationCosts}
          onChange={update('relocationCosts')}
          placeholder="Flights, shipping, deposits, visa fees"
        />
        <CurrencyInput
          label="Monthly rent"
          value={values.monthlyRent}
          onChange={update('monthlyRent')}
          placeholder="Monthly rent at destination"
        />
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1.5">
            <label className="block font-body text-xs font-medium uppercase tracking-widest text-slate">
              School fees per month
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer">
              <span className="text-xs text-slate">Covered by employer?</span>
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
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors
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
          label="Health insurance per month"
          value={values.healthInsurance}
          onChange={update('healthInsurance')}
          placeholder="Monthly premium"
        />
        <CurrencyInput
          label="Monthly living expenses"
          value={values.livingExpenses}
          onChange={update('livingExpenses')}
          placeholder="Everything else — food, transport, utilities, fun"
        />
      </Section>

      <Section title="What you'll earn">
        <CurrencyInput
          label="Expected monthly income"
          value={values.monthlyIncome}
          onChange={update('monthlyIncome')}
          note="Net take-home, not gross"
          placeholder="Monthly after-tax income"
        />
        {values.monthlyIncome > 0 && (
          <NumberInput
            label="Months after arrival until first payday"
            value={values.monthsUntilIncome}
            onChange={update('monthsUntilIncome')}
          />
        )}
      </Section>
    </div>
  );
}
