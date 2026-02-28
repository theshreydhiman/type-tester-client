import type { Mode } from '../context/TestSettingsContext';
import type { Phase } from '../hooks/useTypingTest';

interface Props {
  wpm: number;
  accuracy: number;
  // Meaning varies by mode:
  //   timed → seconds remaining (counts down from duration)
  //   words → words completed  (counts up toward wordCount)
  //   zen   → elapsed seconds  (counts up from 0)
  timeLeft: number;
  phase: Phase;
  duration: number;    // Infinity for words/zen
  mode: Mode;
  wordCount: number;
}

export default function LiveStats({ wpm, accuracy, timeLeft, phase, duration, mode, wordCount }: Props) {
  const isTimedMode = mode === '15' || mode === '30' || mode === '60';
  const isWordsMode = mode === 'words';

  const circumference = 2 * Math.PI * 42;
  const dur = isFinite(duration) ? duration : 30;

  let dashOffset: number;
  let ringColor: string;
  let centerTop: string;
  let centerSub: string;

  if (isTimedMode) {
    const elapsed = dur - timeLeft;
    dashOffset = phase === 'idle' ? 0 : (elapsed / dur) * circumference;
    const isLow = timeLeft <= 5 && phase === 'running';
    ringColor = isLow ? 'var(--accent2)' : 'var(--accent)';
    centerTop = phase === 'idle' ? String(dur) : String(timeLeft);
    centerSub = 'SEC';
  } else if (isWordsMode) {
    // Ring fills as words complete
    dashOffset = phase === 'idle'
      ? circumference
      : circumference - (timeLeft / wordCount) * circumference;
    ringColor = 'var(--accent3)';
    centerTop = phase === 'idle' ? '0' : String(timeLeft);
    centerSub = `/ ${wordCount}`;
  } else {
    // Zen: ring slowly fills, capped at 120s
    const fill = phase === 'running' ? Math.min(timeLeft / 120, 1) : 0;
    dashOffset = circumference - fill * circumference;
    ringColor = 'var(--accent2)';
    centerTop = String(timeLeft);
    centerSub = 'SEC';
  }

  // Third stat label/value
  let thirdVal = '--';
  let thirdLabel = 'DONE';
  if (phase === 'running') {
    if (isTimedMode) {
      thirdVal = `${Math.round(((dur - timeLeft) / dur) * 100)}%`;
      thirdLabel = 'DONE';
    } else if (isWordsMode) {
      thirdVal = String(wordCount - timeLeft);
      thirdLabel = 'LEFT';
    } else {
      thirdVal = String(timeLeft);
      thirdLabel = 'SEC';
    }
  }

  return (
    <div className="flex items-center justify-center gap-10">
      {/* Radial ring */}
      <div className="relative" style={{ width: 100, height: 100, flexShrink: 0 }}>
        <svg width="100" height="100" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
          <defs>
            <filter id="timerGlow">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="3" />
          <circle
            cx="50" cy="50" r="42"
            fill="none"
            stroke={ringColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            filter="url(#timerGlow)"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="font-bold leading-none"
            style={{
              fontFamily: 'Syne, sans-serif',
              fontSize: isWordsMode ? '18px' : '26px',
              color: ringColor,
              transition: 'color 0.3s ease',
            }}
          >
            {centerTop}
          </span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '8px', color: 'var(--text-dim)', letterSpacing: '0.12em', marginTop: '2px' }}>
            {centerSub}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-8">
        <div className="flex flex-col items-center gap-1">
          <span className="leading-none font-bold" style={{ fontFamily: 'Syne, sans-serif', fontSize: '36px', color: phase === 'running' ? 'var(--accent)' : 'var(--text-dim)', transition: 'color 0.2s' }}>
            {phase === 'running' ? wpm : '--'}
          </span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>WPM</span>
        </div>

        <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />

        <div className="flex flex-col items-center gap-1">
          <span className="leading-none font-bold" style={{ fontFamily: 'Syne, sans-serif', fontSize: '36px', color: phase === 'running' ? 'var(--text)' : 'var(--text-dim)', transition: 'color 0.2s' }}>
            {phase === 'running' ? `${accuracy}%` : '--'}
          </span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>ACC</span>
        </div>

        <div style={{ width: '1px', height: '40px', background: 'var(--border)' }} />

        <div className="flex flex-col items-center gap-1">
          <span className="leading-none font-bold" style={{ fontFamily: 'Syne, sans-serif', fontSize: '36px', color: 'var(--text-dim)' }}>
            {thirdVal}
          </span>
          <span style={{ fontFamily: 'Space Mono, monospace', fontSize: '9px', color: 'var(--text-dim)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
            {thirdLabel}
          </span>
        </div>
      </div>
    </div>
  );
}
