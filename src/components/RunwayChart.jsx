import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import { getBreakevenMonth } from '../utils/calculations';

const GREEN = '#0D9488';
const AMBER = '#D97706';
const RED   = '#DC2626';

// Build gradient stops that change colour whenever the balance zone changes.
// Two coincident stops at each transition point give a sharp edge, not a blend.
function buildGradientStops(data, startingBalance) {
  const n = data.length - 1;
  if (n <= 0) return [{ pct: '0%', color: GREEN }];

  const zone = (d) => {
    const ratio = startingBalance > 0 ? d.balance / startingBalance : 0;
    if (ratio > 0.5) return GREEN;
    if (ratio > 0.2) return AMBER;
    return RED;
  };

  const pct = (i) => `${((i / n) * 100).toFixed(2)}%`;
  const stops = [{ pct: pct(0), color: zone(data[0]) }];

  for (let i = 1; i < data.length; i++) {
    const prev = zone(data[i - 1]);
    const curr = zone(data[i]);
    if (curr !== prev) {
      stops.push({ pct: pct(i), color: prev }); // end of previous zone
      stops.push({ pct: pct(i), color: curr });  // start of new zone
    }
  }

  const last = stops[stops.length - 1];
  if (last.pct !== '100.00%') {
    stops.push({ pct: '100%', color: zone(data[data.length - 1]) });
  }

  return stops;
}

function formatAUD(value) {
  if (value >= 1000) return `$${(value / 1000).toFixed(0)}k`;
  return `$${value}`;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload || !payload.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-mist rounded-lg px-4 py-3 shadow-sm text-sm">
      <p className="font-medium text-ink mb-1">
        {d.month === 0 ? 'Arrival' : `Month ${d.month}`}
      </p>
      <p className="text-teal-dark">Balance: ${d.balance.toLocaleString('en-AU')}</p>
      {d.month > 0 && (
        <>
          <p className="text-slate">Income: ${d.income.toLocaleString('en-AU')}</p>
          <p className="text-slate">Expenses: ${d.expenses.toLocaleString('en-AU')}</p>
        </>
      )}
    </div>
  );
}

// Custom SVG label for reference lines — supports a vertical dy offset to prevent collision
function RefLineLabel({ viewBox, value, color, dy = -6 }) {
  if (!viewBox) return null;
  const { x, y } = viewBox;
  return (
    <text
      x={x}
      y={y}
      dy={dy}
      textAnchor="middle"
      fill={color}
      fontSize={11}
      fontFamily="DM Sans, sans-serif"
    >
      {value}
    </text>
  );
}

export default function RunwayChart({ data, incomeStartMonth }) {
  if (!data || data.length < 2) return null;

  const startingBalance = data[0].balance;
  const breakeven = getBreakevenMonth(data);

  const stops = buildGradientStops(data, startingBalance);

  // Reference line collision logic
  const incMonth = (incomeStartMonth > 0 && incomeStartMonth < data.length) ? incomeStartMonth : null;
  const labelDiff = (breakeven !== null && incMonth !== null) ? Math.abs(breakeven - incMonth) : Infinity;
  // Within 1 month → combine into a single label; within 2 months → offset vertically
  const combinedLabel = labelDiff <= 1;
  const nearbyLabel = labelDiff === 2;

  return (
    <div className="w-full min-h-[280px] md:min-h-[400px] px-1">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={data} margin={{ top: 24, right: 16, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="fillGradient" x1="0" y1="0" x2="1" y2="0">
              {stops.map((s, i) => (
                <stop key={i} offset={s.pct} stopColor={s.color} stopOpacity={0.22} />
              ))}
            </linearGradient>
            <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
              {stops.map((s, i) => (
                <stop key={i} offset={s.pct} stopColor={s.color} stopOpacity={1} />
              ))}
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tickFormatter={(m) => (m === 0 ? 'Arrival' : `M${m}`)}
            tick={{ fontSize: 12, fill: '#64748B', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}
            axisLine={{ stroke: '#EDE7D8' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatAUD}
            tick={{ fontSize: 12, fill: '#64748B', fontFamily: 'DM Sans, sans-serif', fontWeight: 400 }}
            axisLine={false}
            tickLine={false}
            width={52}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#EDE7D8" strokeDasharray="4 4" strokeWidth={1} />

          {/* Combined label when lines are ≤1 month apart */}
          {combinedLabel && breakeven !== null && incMonth !== null && (
            <ReferenceLine
              x={incMonth}
              stroke="#0D9488"
              strokeDasharray="4 4"
              label={<RefLineLabel value="Income starts / Breakeven" color="#0D9488" dy={-6} />}
            />
          )}

          {/* Breakeven line (standalone or nearby-offset) */}
          {!combinedLabel && breakeven !== null && (
            <ReferenceLine
              x={breakeven}
              stroke="#0D9488"
              strokeDasharray="4 4"
              label={<RefLineLabel value="Breakeven" color="#0D9488" dy={-6} />}
            />
          )}

          {/* Income starts line (standalone or nearby-offset) */}
          {!combinedLabel && incMonth !== null && (
            <ReferenceLine
              x={incMonth}
              stroke="#64748B"
              strokeDasharray="4 4"
              label={<RefLineLabel value="Income starts" color="#64748B" dy={nearbyLabel ? 10 : -6} />}
            />
          )}

          <Area
            type="monotone"
            dataKey="balance"
            stroke="url(#strokeGradient)"
            strokeWidth={2}
            fill="url(#fillGradient)"
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
