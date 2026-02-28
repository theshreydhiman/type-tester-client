import { useEffect, useRef } from 'react';
import type { WordState } from '../hooks/useTypingTest';

interface Props {
  words: WordState[];
  currentWordIdx: number;
  currentInput: string;
}

export default function WordDisplay({ words, currentWordIdx, currentInput }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const activeWordRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (activeWordRef.current && containerRef.current) {
      const wordTop = activeWordRef.current.offsetTop;
      const container = containerRef.current;
      const rowPitch = 56;
      const targetScroll = Math.max(0, wordTop - rowPitch);
      container.scrollTop = targetScroll;
    }
  }, [currentWordIdx]);

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden select-none"
      style={{ height: '160px' }}
    >
      <div
        className="flex flex-wrap gap-x-3 gap-y-2 text-2xl leading-[3rem]"
        style={{ fontFamily: 'Space Mono, monospace' }}
      >
        {words.map((wordState, wIdx) => {
          const isActive = wIdx === currentWordIdx;
          const isPast = wIdx < currentWordIdx;
          const displayChars = isActive
            ? wordState.word.split('').map((c, i) => ({
              char: c,
              status: i < currentInput.length
                ? currentInput[i] === c ? 'correct' : 'wrong'
                : 'untyped',
            }))
            : wordState.chars;

          const extraChars = isActive && currentInput.length > wordState.word.length
            ? currentInput.slice(wordState.word.length).split('').map(c => ({
              char: c,
              status: 'extra' as const,
            }))
            : [];

          return (
            <span
              key={wIdx}
              ref={isActive ? activeWordRef : null}
              className="relative inline-block"
              style={{
                borderBottom: isActive
                  ? '2px solid var(--accent)'
                  : wordState.status === 'wrong'
                    ? '1px solid var(--accent2)'
                    : '2px solid transparent',
                transition: 'border-color 0.15s',
              }}
            >
              {displayChars.map((cs, cIdx) => {
                const isCurrentCursor = isActive && cIdx === currentInput.length;
                return (
                  <span
                    key={cIdx}
                    className="relative"
                    style={{
                      color: cs.status === 'correct'
                        ? 'var(--text)'
                        : cs.status === 'wrong'
                          ? 'var(--accent2)'
                          : isPast
                            ? 'var(--text-muted)'
                            : 'var(--text-dim)',
                      background: cs.status === 'wrong' ? 'rgba(250,109,143,0.12)' : undefined,
                    }}
                  >
                    {isCurrentCursor && (
                      <span
                        className="absolute left-0 top-1 bottom-1"
                        style={{
                          width: '2px',
                          background: 'var(--accent)',
                          borderRadius: '2px',
                          boxShadow: '0 0 8px var(--accent)',
                          animation: 'blink 1s step-end infinite',
                        }}
                      />
                    )}
                    {cs.char}
                  </span>
                );
              })}

              {extraChars.map((ec, eIdx) => (
                <span
                  key={`extra-${eIdx}`}
                  style={{ color: 'var(--accent2)', background: 'rgba(250,109,143,0.12)' }}
                >
                  {ec.char}
                </span>
              ))}

              {isActive && currentInput.length === wordState.word.length + extraChars.length && (
                <span
                  className="inline-block align-middle"
                  style={{
                    width: '2px',
                    height: '1.2em',
                    background: 'var(--accent)',
                    borderRadius: '2px',
                    boxShadow: '0 0 8px var(--accent)',
                    animation: 'blink 1s step-end infinite',
                  }}
                />
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}
