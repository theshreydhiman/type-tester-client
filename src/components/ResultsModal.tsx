import { useState, useEffect, useRef } from 'react';
import { RotateCcw, LogIn, Download, History } from 'lucide-react';
import { generateCertificate } from '../utils/generateCertificate';
import { useNavigate } from 'react-router-dom';
import type { TestResult } from '../hooks/useTypingTest';
import WpmChart from './WpmChart';
import AnalysisPanel from './AnalysisPanel';
import KeyboardHeatmap from './KeyboardHeatmap';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

interface Props {
  result: TestResult;
  onReset: () => void;
  previousBest?: { wpm: number; accuracy: number } | null;
}

function BigStat({ value, unit, color }: { value: string | number; unit: string; color: string }) {
  return (
    <div className="flex flex-col gap-1 sm:gap-1.5 px-4 sm:px-6 py-4 sm:py-6" style={{ background: 'var(--surface2)' }}>
      <div className="text-3xl sm:text-5xl leading-none font-bold" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.04em', color }}>
        {value}
      </div>
      <div style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', letterSpacing: '0.15em', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
        {unit}
      </div>
    </div>
  );
}

const btnBase: React.CSSProperties = {
  fontFamily: 'Syne, sans-serif',
  fontSize: '14px',
  padding: '12px 24px',
  borderRadius: '10px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  cursor: 'pointer',
  border: 'none',
  fontWeight: 600,
  transition: 'opacity 0.15s',
};

export default function ResultsModal({ result, onReset, previousBest }: Props) {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [isNewBest, setIsNewBest] = useState(false);
  const saveCalledRef = useRef(false);

  useEffect(() => {
    if (previousBest && result.wpm > previousBest.wpm) setIsNewBest(true);
    if (user && token) handleSave();
  }, []);

  const handleSave = async () => {
    if (saveCalledRef.current) return;
    saveCalledRef.current = true;
    try {
      await axios.post('/api/results', {
        wpm: result.wpm,
        rawWpm: result.rawWpm,
        accuracy: result.accuracy,
        consistency: result.consistency,
        charsCorrect: result.charsCorrect,
        charsWrong: result.charsWrong,
        duration: result.duration,
        charErrors: result.charErrors,
        wpmTimeline: result.wpmTimeline,
      });
    } catch { /* silently fail */ }
  };

  const handleLoginToSave = () => {
    localStorage.setItem('tt_pending_result', JSON.stringify({
      wpm: result.wpm,
      rawWpm: result.rawWpm,
      accuracy: result.accuracy,
      consistency: result.consistency,
      charsCorrect: result.charsCorrect,
      charsWrong: result.charsWrong,
      duration: result.duration,
      charErrors: result.charErrors,
      wpmTimeline: result.wpmTimeline,
    }));
    navigate('/login');
  };


  const handleViewHistory = () => {
    navigate('/profile');
  };

  const wpmDiff = previousBest ? result.wpm - previousBest.wpm : null;

  return (
    <div className="animate-slideUp w-full" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Header */}
      <div className="text-center mb-8">
        {isNewBest && (
          <div className="inline-block text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-3" style={{ fontFamily: 'Space Mono, monospace', background: 'rgba(109,250,205,0.15)', border: '1px solid rgba(109,250,205,0.3)', color: 'var(--accent3)' }}>
            New Personal Best!
          </div>
        )}
        <h2 className="font-bold leading-tight text-2xl sm:text-4xl" style={{ fontFamily: 'Syne, sans-serif', letterSpacing: '-0.03em' }}>
          You typed{' '}
          <span style={{ background: 'linear-gradient(135deg, var(--accent3), var(--accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {result.wpm} WPM
          </span>
          {wpmDiff !== null && (
            <span className="ml-2 text-base sm:text-lg" style={{ fontFamily: 'Space Mono, monospace', color: wpmDiff >= 0 ? 'var(--accent3)' : 'var(--accent2)', WebkitTextFillColor: 'unset' }}>
              {wpmDiff >= 0 ? `+${wpmDiff}` : wpmDiff} vs best
            </span>
          )}
        </h2>
        <p className="mt-2" style={{ fontFamily: 'Space Mono, monospace', fontSize: '12px', color: 'var(--text-muted)' }}>
          {result.mode === 'words' ? `${result.duration}s elapsed` : `${result.duration}s`} · {result.language} · {result.charsTotal} chars
        </p>
      </div>

      {/* Big stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 mb-5 overflow-hidden" style={{ borderRadius: '16px', gap: '2px', background: 'var(--border)' }}>
        <BigStat value={result.wpm} unit="WPM" color="#f5c842" />
        <BigStat value={result.rawWpm} unit="Raw WPM" color="var(--accent3)" />
        <BigStat value={`${result.accuracy}%`} unit="Accuracy" color="var(--accent)" />
        <BigStat value={`${result.consistency}%`} unit="Consistency" color="var(--accent2)" />
      </div>

      {/* Chart + Heatmap */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl p-5" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <WpmChart wpmTimeline={result.wpmTimeline} />
        </div>
        <div className="rounded-xl p-5" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
          <KeyboardHeatmap charErrors={result.charErrors} totalChars={result.charsTotal} />
        </div>
      </div>

      {/* Analysis */}
      <div className="rounded-xl p-5 mb-6" style={{ background: 'var(--surface2)', border: '1px solid var(--border)' }}>
        <AnalysisPanel result={result} />
      </div>

      {/* CTA buttons */}
      <div className="flex items-center justify-center gap-3 flex-wrap">
        {/* Try Again */}
        <button
          onClick={onReset}
          style={{ ...btnBase, background: 'linear-gradient(135deg, var(--accent), #5c4de8)', color: '#fff', boxShadow: '0 8px 24px rgba(124,109,250,0.3)' }}
        >
          <RotateCcw size={15} />
          Try Again
        </button>

        {/* Certificate */}
        <button
          onClick={() => generateCertificate(result)}
          style={{ ...btnBase, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
        >
          <Download size={15} />
          Get Certificate
        </button>

        {/* View History — only if logged in */}
        {user && (
          <button
            onClick={handleViewHistory}
            style={{ ...btnBase, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            <History size={15} />
            View History
          </button>
        )}

        {/* Login to save — only if not logged in */}
        {!user && (
          <button
            onClick={handleLoginToSave}
            style={{ ...btnBase, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}
          >
            <LogIn size={15} />
            Login to save
          </button>
        )}
      </div>
    </div>
  );
}
