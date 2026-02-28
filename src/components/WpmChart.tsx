import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

interface Props {
  wpmTimeline: number[];
  label?: string;
}

interface DataPoint {
  second: number;
  wpm: number;
}

export default function WpmChart({ wpmTimeline, label = 'WPM Over Time' }: Props) {
  if (!wpmTimeline || wpmTimeline.length === 0) return null;

  const data: DataPoint[] = wpmTimeline.map((wpm, i) => ({
    second: i + 1,
    wpm,
  }));

  return (
    <div className="w-full">
      <h3
        className="uppercase mb-4"
        style={{
          fontFamily: 'Space Mono, monospace',
          fontSize: '10px',
          letterSpacing: '0.15em',
          color: 'var(--text-dim)',
        }}
      >
        ⚡ {label}
      </h3>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={data} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="wpmGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7c6dfa" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#7c6dfa" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="second"
            tick={{ fill: '#2e2e42', fontSize: 10, fontFamily: 'Space Mono' }}
            tickLine={false}
            axisLine={false}
            label={{ value: 'sec', position: 'insideBottom', offset: -2, fill: '#2e2e42', fontSize: 9 }}
          />
          <YAxis
            tick={{ fill: '#2e2e42', fontSize: 10, fontFamily: 'Space Mono' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--surface2)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '8px',
              color: 'var(--text)',
              fontSize: '11px',
              fontFamily: 'Space Mono',
            }}
            labelStyle={{ color: 'var(--text-dim)' }}
            formatter={(v: number) => [v, 'WPM']}
            labelFormatter={(l: number) => `${l}s`}
          />
          <Area
            type="monotone"
            dataKey="wpm"
            stroke="#7c6dfa"
            strokeWidth={2}
            fill="url(#wpmGrad)"
            dot={false}
            activeDot={{ r: 4, fill: '#7c6dfa', strokeWidth: 0 }}
            style={{ filter: 'drop-shadow(0 0 4px rgba(124,109,250,0.5))' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
