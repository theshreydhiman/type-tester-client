import { useEffect, useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { useTypingTest } from '../hooks/useTypingTest';
import WordDisplay from '../components/WordDisplay';
import LiveStats from '../components/LiveStats';
import ResultsModal from '../components/ResultsModal';
import { useAuth } from '../context/AuthContext';
import { useTestSettings } from '../context/TestSettingsContext';
import axios from 'axios';

export default function Home() {
  const settings = useTestSettings();
  const {
    words, phase, timeLeft, currentWordIdx,
    currentInput, liveWpm, liveAccuracy,
    result, handleInput, reset, undoWord,
  } = useTypingTest({
    mode: settings.mode,
    language: settings.language,
    duration: settings.duration,
    wordCount: settings.wordCount,
  });

  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [previousBest, setPreviousBest] = useState<{ wpm: number; accuracy: number } | null>(null);
  // Reset whenever mode or language changes
  useEffect(() => {
    reset();
  }, [settings.mode, settings.language]);

  // Fetch user's best on mount
  useEffect(() => {
    if (user) {
      axios.get('/api/results/me?limit=1&sort=wpm').then(res => {
        const best = res.data.results?.[0];
        if (best) setPreviousBest({ wpm: best.wpm, accuracy: best.accuracy });
      }).catch(() => { });
    }
  }, [user]);

  // Auto-focus hidden input; recapture on any keydown
  useEffect(() => {
    inputRef.current?.focus();
  }, [phase]);

  useEffect(() => {
    const refocus = () => inputRef.current?.focus();
    document.addEventListener('keydown', refocus, true);
    return () => document.removeEventListener('keydown', refocus, true);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      reset();
    }
    if (e.key === 'Escape') {
      reset();
    }
    // Ctrl+Z / Cmd+Z — undo last word
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
      e.preventDefault();
      undoWord();
    }
  };

  const modeLabel =
    settings.mode === 'words' ? `${settings.wordCount} words`
    : settings.mode === 'zen' ? 'zen mode — press Tab to finish'
    : `${settings.mode} seconds`;

  if (phase === 'done') {
    return (
      <div className="relative min-h-[calc(100vh-65px)] overflow-hidden" style={{ background: 'var(--bg)' }}>
        <div className="absolute pointer-events-none" style={{ width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,109,250,0.12), transparent)', filter: 'blur(80px)', top: '-100px', left: '-100px', animation: 'orbFloat 12s ease-in-out infinite' }} />
        <div className="absolute pointer-events-none" style={{ width: '400px', height: '400px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,109,143,0.08), transparent)', filter: 'blur(80px)', bottom: '-50px', right: '100px', animation: 'orbFloat 16s ease-in-out infinite reverse' }} />
        <div className="relative z-10 flex flex-col items-center justify-start px-4 py-10 max-w-4xl mx-auto">
          <ResultsModal result={result!} onReset={reset} previousBest={previousBest} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[calc(100vh-65px)] overflow-hidden" style={{ background: 'var(--bg)' }}>
      {/* Ambient orbs */}
      <div className="absolute pointer-events-none" style={{ width: '500px', height: '500px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,109,250,0.15), transparent)', filter: 'blur(100px)', top: '-150px', left: '-100px', animation: 'orbFloat 14s ease-in-out infinite' }} />
      <div className="absolute pointer-events-none" style={{ width: '350px', height: '350px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(250,109,143,0.1), transparent)', filter: 'blur(80px)', bottom: '-80px', right: '80px', animation: 'orbFloat 18s ease-in-out infinite reverse' }} />

      <div className="relative z-10 w-full max-w-3xl px-4">
        {/* Idle hint */}
        {phase === 'idle' && (
          <p className="text-center text-sm mb-8 animate-fadeIn" style={{ fontFamily: 'Space Mono, monospace', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
            start typing to begin · {modeLabel}
          </p>
        )}

        {/* Live stats */}
        <div className="relative mb-8">
          <LiveStats
            wpm={liveWpm}
            accuracy={liveAccuracy}
            timeLeft={timeLeft}
            phase={phase}
            duration={settings.duration}
            mode={settings.mode}
            wordCount={settings.wordCount}
          />
        </div>

        {/* Typing area */}
        <div className="relative rounded-2xl cursor-text" onClick={() => inputRef.current?.focus()}>
          <WordDisplay words={words} currentWordIdx={currentWordIdx} currentInput={currentInput} />

          <input
            ref={inputRef}
            value={currentInput}
            onChange={e => handleInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="absolute opacity-0 top-0 left-0 w-px h-px"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
        </div>

        {/* Keyboard hints */}
        <div className="flex items-center justify-center gap-6 mt-8">
          {[
            { key: 'Esc', label: 'reset' },
          ].map(({ key, label }) => (
            <span key={key} className="flex items-center gap-2" style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em' }}>
              <kbd className="rounded px-2 py-0.5 text-[9px]" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-muted)', boxShadow: '0 2px 0 rgba(0,0,0,0.4)' }}>
                {key}
              </kbd>
              {label}
            </span>
          ))}
          <button
            onClick={reset}
            className="flex items-center gap-1.5 transition-colors cursor-pointer bg-transparent border-0 p-0"
            style={{ fontFamily: 'Space Mono, monospace', fontSize: '10px', color: 'var(--text-dim)', letterSpacing: '0.1em' }}
            onMouseEnter={e => (e.currentTarget.style.color = 'var(--text-muted)')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-dim)')}
          >
            <RotateCcw size={11} />
            reset
          </button>
        </div>
      </div>
    </div>
  );
}
