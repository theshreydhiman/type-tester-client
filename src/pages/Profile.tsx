import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Target, Activity, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import axios from 'axios';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { FINGER_LABELS, FINGER_MAP } from '../utils/words';

interface TestResult {
  id: number;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  charsCorrect: number;
  charsWrong: number;
  duration: number;
  charErrors: Record<string, number>;
  wpmTimeline: number[];
  createdAt: string;
}

interface Stats {
  bestWpm: number;
  avgWpm: number;
  avg10Wpm: number;
  bestAccuracy: number;
  avgAccuracy: number;
  totalTests: number;
  totalTimeSeconds: number;
  totalCharsTyped: number;
}

function StatCard({ icon, label, value, sub }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string;
}) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}
    >
      <div
        className="flex items-center gap-2 uppercase mb-3"
        style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.15em', color: 'var(--text-dim)' }}
      >
        {icon}
        <span>{label}</span>
      </div>
      <div
        className="font-bold"
        style={{ fontFamily: 'Syne, sans-serif', fontSize: '30px', color: 'var(--accent)' }}
      >
        {value}
      </div>
      {sub && (
        <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px', fontFamily: 'Space Mono, monospace' }}>
          {sub}
        </div>
      )}
    </div>
  );
}

function Trend({ current, previous }: { current: number; previous: number }) {
  const diff = current - previous;
  if (Math.abs(diff) < 0.5) return <Minus size={14} style={{ color: 'var(--text-dim)' }} />;
  return diff > 0
    ? <TrendingUp size={14} style={{ color: 'var(--accent3)' }} />
    : <TrendingDown size={14} style={{ color: 'var(--accent2)' }} />;
}

const BUCKETS = 20;
function downsample(arr: number[], n: number): number[] {
  if (arr.length === 0) return Array(n).fill(0);
  if (arr.length === 1) return Array(n).fill(arr[0]);
  return Array.from({ length: n }, (_, i) => {
    const pos = (i / (n - 1)) * (arr.length - 1);
    const lo = Math.floor(pos);
    const hi = Math.min(lo + 1, arr.length - 1);
    return Math.round(arr[lo] * (1 - (pos - lo)) + arr[hi] * (pos - lo));
  });
}

const cardStyle = { background: 'var(--surface2)', border: '1px solid var(--border)' };
const labelStyle = {
  fontFamily: 'Space Mono, monospace',
  fontSize: '10px',
  letterSpacing: '0.15em',
  color: 'var(--text-dim)',
  textTransform: 'uppercase' as const,
  marginBottom: '16px',
};

export default function Profile() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<TestResult[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      axios.get('/api/results/me?limit=50'),
      axios.get('/api/results/stats'),
    ]).then(([resResults, resStats]) => {
      setResults(resResults.data.results || []);
      setStats(resStats.data);
    }).catch(() => {}).finally(() => setFetching(false));
  }, [user]);

  const last10 = results.slice(0, 10);
  const avg10Wpm = last10.length > 0
    ? Math.round(last10.reduce((s, r) => s + r.wpm, 0) / last10.length)
    : 0;

  const last5Tests = useMemo(() => results.slice(0, 5).reverse(), [results]);

  const chartData = useMemo(() => {
    const sampled = last5Tests.map(r => downsample(r.wpmTimeline || [], BUCKETS));
    return Array.from({ length: BUCKETS }, (_, i) => {
      const point: Record<string, number | null> = { t: i, avg10: avg10Wpm };
      sampled.forEach((tl, j) => { point[`t${j}`] = tl[i] !== undefined ? tl[i] : null; });
      return point;
    });
  }, [last5Tests, avg10Wpm]);

  if (loading || fetching) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-65px)]">
        <div
          className="animate-pulse"
          style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: 'var(--text-dim)' }}
        >
          Loading...
        </div>
      </div>
    );
  }

  if (!user) return null;

  const testColors = ['#7c6dfa', '#fa6d8f', '#6dc8fa', '#fac96d', '#6dfa9c'];
  const testOpacity = [0.25, 0.35, 0.5, 0.7, 1];

  const allCharErrors: Record<string, number> = {};
  results.forEach(r => {
    if (r.charErrors) {
      Object.entries(r.charErrors).forEach(([c, n]) => {
        allCharErrors[c] = (allCharErrors[c] || 0) + n;
      });
    }
  });
  const topProblems = Object.entries(allCharErrors)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const fingerErrors: Record<string, number> = {};
  Object.entries(allCharErrors).forEach(([char, count]) => {
    const finger = FINGER_MAP[char.toLowerCase()] || 'unknown';
    fingerErrors[finger] = (fingerErrors[finger] || 0) + count;
  });
  const topFingers = Object.entries(fingerErrors)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4);

  const last = results[0];

  const totalMinutes = stats ? Math.round(stats.totalTimeSeconds / 60) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-base"
            style={{
              background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
              fontFamily: 'Syne, sans-serif',
              color: '#fff',
            }}
          >
            {user.username.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <h1
              className="font-bold"
              style={{ fontFamily: 'Syne, sans-serif', fontSize: '22px', color: 'var(--text)' }}
            >
              {user.username}
            </h1>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '2px' }}>{user.email}</p>
          </div>
        </div>
        {last && (
          <div className="flex items-center gap-2 sm:justify-end">
            <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontFamily: 'Space Mono, monospace' }}>
              Last test:
            </span>
            <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '13px', color: 'var(--text)' }}>
              {last.wpm} WPM / {last.accuracy}%
            </span>
            <Trend current={last.wpm} previous={avg10Wpm} />
          </div>
        )}
      </div>

      {/* Stat cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={<Trophy size={13} />} label="Best WPM" value={stats.bestWpm} sub="All time" />
          <StatCard icon={<Activity size={13} />} label="Avg WPM" value={stats.avgWpm} sub={`Last 10: ${stats.avg10Wpm}`} />
          <StatCard icon={<Target size={13} />} label="Best Accuracy" value={`${stats.bestAccuracy}%`} sub={`Avg: ${stats.avgAccuracy}%`} />
          <StatCard icon={<Clock size={13} />} label="Total Time" value={`${totalMinutes}m`} sub={`${stats.totalTests} tests`} />
        </div>
      )}

      {/* Latest vs history */}
      {last && stats && (
        <div className="rounded-xl p-6" style={cardStyle}>
          <h2 style={labelStyle}>Latest vs History</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            {[
              { label: 'WPM', current: last.wpm, best: stats.bestWpm, avg: avg10Wpm },
              { label: 'Accuracy', current: last.accuracy, best: stats.bestAccuracy, avg: stats.avgAccuracy },
              { label: 'Consistency', current: last.consistency, best: null, avg: null },
              { label: 'Raw WPM', current: last.rawWpm, best: null, avg: null },
            ].map(({ label, current, best, avg }) => (
              <div key={label} className="space-y-1">
                <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.15em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  {label}
                </div>
                <div style={{ fontFamily: 'Syne, sans-serif', fontSize: '26px', fontWeight: 700, color: 'var(--accent)' }}>
                  {current}
                </div>
                {best !== null && (
                  <div className="flex items-center justify-center gap-1" style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    Best: <span style={{ color: 'var(--text)' }}>{best}</span>
                    <Trend current={current} previous={best} />
                  </div>
                )}
                {avg !== null && (
                  <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                    Avg 10: <span style={{ color: 'var(--text)' }}>{avg}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance trend chart */}
      {last5Tests.length > 0 && (
        <div className="rounded-xl p-6" style={cardStyle}>
          <h2 style={labelStyle}>Performance Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={chartData} margin={{ top: 4, right: 16, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="t" hide />
              <YAxis tick={{ fill: '#2e2e42', fontSize: 10, fontFamily: 'Space Mono' }} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--surface)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  borderRadius: '8px',
                  color: 'var(--text)',
                  fontSize: '11px',
                  fontFamily: 'Space Mono',
                }}
                labelStyle={{ color: 'var(--text-dim)' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', color: 'var(--text-dim)', paddingTop: '8px', fontFamily: 'Space Mono' }} />
              {last5Tests.map((_, j) => (
                <Line
                  key={j}
                  type="monotone"
                  dataKey={`t${j}`}
                  stroke={testColors[j]}
                  strokeWidth={j === last5Tests.length - 1 ? 2.5 : 1.5}
                  strokeOpacity={testOpacity[j]}
                  dot={false}
                  connectNulls
                  isAnimationActive={false}
                  name={j === last5Tests.length - 1 ? 'Latest' : `Test -${last5Tests.length - 1 - j}`}
                />
              ))}
              <Line type="monotone" dataKey="avg10" stroke="rgba(255,255,255,0.25)" strokeWidth={1.5} dot={false} strokeDasharray="4 2" isAnimationActive={false} name="Avg Last 10" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Problem areas */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {topProblems.length > 0 && (
          <div className="rounded-xl p-6" style={cardStyle}>
            <h2 style={labelStyle}>Problem Characters (All Time)</h2>
            <div className="flex flex-wrap gap-2">
              {topProblems.map(([char, count]) => (
                <div
                  key={char}
                  className="flex flex-col items-center p-2 rounded-lg"
                  style={{
                    minWidth: '48px',
                    background: 'rgba(250,109,143,0.08)',
                    border: '1px solid rgba(250,109,143,0.2)',
                  }}
                >
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '18px', fontWeight: 700, color: 'var(--accent2)' }}>
                    {char === ' ' ? '␣' : char}
                  </span>
                  <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-dim)', marginTop: '2px' }}>
                    {count}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {topFingers.length > 0 && (
          <div className="rounded-xl p-6" style={cardStyle}>
            <h2 style={labelStyle}>Weakest Fingers (All Time)</h2>
            <div className="space-y-3">
              {topFingers.map(([finger, errors]) => {
                const maxErr = topFingers[0][1];
                const pct = Math.round((errors / maxErr) * 100);
                return (
                  <div key={finger}>
                    <div className="flex justify-between mb-1.5">
                      <span style={{ fontSize: '13px', color: 'var(--text)' }}>{FINGER_LABELS[finger] || finger}</span>
                      <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: 'var(--text-dim)' }}>
                        {errors} errors
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, background: 'linear-gradient(90deg, var(--accent), var(--accent2))' }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Recent tests table */}
      {results.length > 0 && (
        <div className="rounded-xl overflow-hidden" style={cardStyle}>
          <div
            className="px-6 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h2 style={{ ...labelStyle, marginBottom: 0 }}>Recent Tests</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['WPM', 'Raw WPM', 'Accuracy', 'Consistency', 'Errors', 'Date'].map(h => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left font-normal"
                      style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', letterSpacing: '0.15em', color: 'var(--text-dim)', textTransform: 'uppercase' }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.slice(0, 20).map((r, i) => (
                  <tr
                    key={r.id}
                    style={{
                      borderBottom: '1px solid var(--border)',
                      background: i === 0 ? 'rgba(124,109,250,0.04)' : undefined,
                      transition: 'background 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                    onMouseLeave={e => (e.currentTarget.style.background = i === 0 ? 'rgba(124,109,250,0.04)' : '')}
                  >
                    <td className="px-6 py-3 font-bold" style={{ fontFamily: 'Space Mono, monospace', color: 'var(--accent)' }}>{r.wpm}</td>
                    <td className="px-6 py-3" style={{ fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)' }}>{r.rawWpm}</td>
                    <td className="px-6 py-3" style={{ fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)' }}>{r.accuracy}%</td>
                    <td className="px-6 py-3" style={{ fontFamily: 'Space Mono, monospace', color: 'var(--text-muted)' }}>{r.consistency}%</td>
                    <td className="px-6 py-3" style={{ fontFamily: 'Space Mono, monospace', color: 'var(--accent2)' }}>{r.charsWrong}</td>
                    <td className="px-6 py-3" style={{ fontFamily: 'Space Mono, monospace', fontSize: '11px', color: 'var(--text-dim)' }}>
                      {new Date(r.createdAt).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {results.length === 0 && (
        <div className="text-center py-16">
          <p style={{ fontSize: '16px', color: 'var(--text-muted)', marginBottom: '8px' }}>No tests yet</p>
          <p style={{ fontSize: '13px', color: 'var(--text-dim)' }}>Complete a typing test to see your stats here.</p>
        </div>
      )}
    </div>
  );
}
