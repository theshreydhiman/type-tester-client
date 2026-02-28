import { FINGER_MAP, FINGER_LABELS } from '../utils/words';
import type { TestResult } from '../hooks/useTypingTest';

interface Props {
  result: TestResult;
}

export default function AnalysisPanel({ result }: Props) {
  const { charErrors, charSubstitutions, fingerErrors } = result;

  const problemChars = Object.entries(charErrors)
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const substitutions: Array<{ expected: string; typed: string; count: number }> = [];
  Object.entries(charSubstitutions).forEach(([expected, typedMap]) => {
    Object.entries(typedMap).forEach(([typed, count]) => {
      substitutions.push({ expected, typed, count });
    });
  });
  substitutions.sort((a, b) => b.count - a.count);
  const topSubs = substitutions.slice(0, 5);

  const fingerEntries = Object.entries(fingerErrors)
    .filter(([, c]) => c > 0)
    .sort(([, a], [, b]) => b - a);

  const worstFinger = fingerEntries[0];

  const suggestions: string[] = [];
  if (problemChars.length > 0) {
    const chars = problemChars.slice(0, 3).map(([c]) => `"${c}"`).join(', ');
    suggestions.push(`Practice typing: ${chars} — these are your most error-prone characters.`);
  }
  if (worstFinger) {
    const finger = FINGER_LABELS[worstFinger[0]] || worstFinger[0];
    const keys = Object.entries(FINGER_MAP)
      .filter(([, f]) => f === worstFinger[0])
      .map(([k]) => k)
      .filter(k => k !== ' ')
      .join(', ');
    suggestions.push(`${finger} is your weakest finger. Focus on these keys: ${keys}`);
  }
  if (result.consistency < 70) {
    suggestions.push('Your speed is inconsistent. Try to maintain a steady rhythm rather than bursting fast then slowing down.');
  }
  if (result.accuracy < 90) {
    suggestions.push('Accuracy is below 90%. Slow down and focus on precision — speed will follow naturally.');
  }
  if (topSubs.length > 0) {
    const s = topSubs[0];
    suggestions.push(`You often type "${s.typed}" when you mean "${s.expected}" (${s.count}x). Pay extra attention there.`);
  }
  if (suggestions.length === 0) {
    suggestions.push('Great job! No major weakness detected. Keep practicing to build more speed.');
  }

  const labelStyle = {
    fontFamily: 'Space Mono, monospace',
    fontSize: '10px',
    letterSpacing: '0.15em',
    color: 'var(--text-dim)',
    textTransform: 'uppercase' as const,
    marginBottom: '12px',
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Improvement Tips */}
      <div>
        <h3 style={labelStyle}>Improvement Tips</h3>
        <div className="space-y-2">
          {suggestions.map((s, i) => (
            <div
              key={i}
              className="flex gap-3 p-3 rounded-lg text-sm"
              style={{
                background: 'rgba(124,109,250,0.06)',
                border: '1px solid rgba(124,109,250,0.12)',
                color: 'var(--text-muted)',
              }}
            >
              <span style={{ color: 'var(--accent)', fontWeight: 700, flexShrink: 0 }}>→</span>
              <span>{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Problem Characters */}
        {problemChars.length > 0 && (
          <div>
            <h3 style={labelStyle}>Problem Characters</h3>
            <div className="flex flex-wrap gap-2">
              {problemChars.map(([char, count]) => (
                <div
                  key={char}
                  className="flex flex-col items-center p-2 rounded-lg"
                  style={{
                    minWidth: '48px',
                    background: 'rgba(250,109,143,0.08)',
                    border: '1px solid rgba(250,109,143,0.2)',
                  }}
                >
                  <span
                    className="font-bold"
                    style={{
                      fontFamily: 'Space Mono, monospace',
                      fontSize: '18px',
                      color: 'var(--accent2)',
                    }}
                  >
                    {char === ' ' ? '␣' : char}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Space Mono, monospace',
                      fontSize: '9px',
                      color: 'var(--text-dim)',
                      marginTop: '2px',
                    }}
                  >
                    {count}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Common Substitutions */}
        {topSubs.length > 0 && (
          <div>
            <h3 style={labelStyle}>Common Mistakes</h3>
            <div className="space-y-1.5">
              {topSubs.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <span
                    className="rounded px-2 py-0.5"
                    style={{
                      fontFamily: 'Space Mono, monospace',
                      color: 'var(--text)',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {s.expected}
                  </span>
                  <span style={{ color: 'var(--text-dim)', fontSize: '11px' }}>→ typed</span>
                  <span
                    className="rounded px-2 py-0.5"
                    style={{
                      fontFamily: 'Space Mono, monospace',
                      color: 'var(--accent2)',
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {s.typed}
                  </span>
                  <span
                    className="ml-auto"
                    style={{
                      fontFamily: 'Space Mono, monospace',
                      fontSize: '9px',
                      color: 'var(--text-dim)',
                    }}
                  >
                    {s.count}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Finger Analysis */}
      {fingerEntries.length > 0 && (
        <div>
          <h3 style={labelStyle}>Finger Performance</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {fingerEntries.map(([finger, errors]) => (
              <div
                key={finger}
                className="p-2 rounded-lg text-center"
                style={{
                  background: 'rgba(250,109,143,0.08)',
                  border: '1px solid rgba(250,109,143,0.15)',
                }}
              >
                <div
                  className="font-bold"
                  style={{ fontFamily: 'Syne, sans-serif', fontSize: '18px', color: 'var(--accent2)' }}
                >
                  {errors}
                </div>
                <div
                  style={{
                    fontFamily: 'Space Mono, monospace',
                    fontSize: '8px',
                    color: 'var(--text-dim)',
                    marginTop: '2px',
                  }}
                >
                  {FINGER_LABELS[finger] || finger}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
