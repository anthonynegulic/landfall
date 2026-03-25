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

  // Determine color zones
  const chartData = data.map((d) => {
    const ratio = startingBalance > 0 ? d.balance / startingBalance : 0;
    let fill;
    if (ratio > 0.5) fill = '#0D9488';
    else if (ratio > 0.2) fill = '#D97706';
    else fill = '#DC2626';
    return { ...d, fill };
  });

  const lastRatio = startingBalance > 0
    ? chartData[chartData.length - 1].balance / startingBalance
    : 0;
  const areaColor = lastRatio > 0.5 ? '#0D9488' : lastRatio > 0.2 ? '#D97706' : '#DC2626';

  // Reference line collision logic
  const incMonth = (incomeStartMonth > 0 && incomeStartMonth < data.length) ? incomeStartMonth : null;
  const labelDiff = (breakeven !== null && incMonth !== null) ? Math.abs(breakeven - incMonth) : Infinity;
  // Within 1 month → combine into a single label; within 2 months → offset vertically
  const combinedLabel = labelDiff <= 1;
  const nearbyLabel = labelDiff === 2;

  return (
    <div className="w-full min-h-[280px] md:min-h-[400px] px-1">
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart data={chartData} margin={{ top: 24, right: 16, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={areaColor} stopOpacity={0.3} />
              <stop offset="100%" stopColor={areaColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="month"
            tickFormatter={(m) => (m === 0 ? 'Arrival' : `M${m}`)}
            tick={{ fontSize: 12, fill: '#64748B' }}
            axisLine={{ stroke: '#EDE7D8' }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatAUD}
            tick={{ fontSize: 12, fill: '#64748B' }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="#DC2626" strokeDasharray="4 4" strokeOpacity={0.5} />

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
            stroke={areaColor}
            strokeWidth={2}
            fill="url(#balanceGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
