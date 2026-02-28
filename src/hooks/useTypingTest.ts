import { useState, useEffect, useCallback, useRef } from 'react';
import { getWordsByLanguage, FINGER_MAP } from '../utils/words';
import type { Language } from '../utils/words';
import type { Mode } from '../context/TestSettingsContext';

export type Phase = 'idle' | 'running' | 'done';

export interface CharState {
  char: string;
  status: 'untyped' | 'correct' | 'wrong' | 'extra';
}

export interface WordState {
  word: string;
  chars: CharState[];
  status: 'untyped' | 'active' | 'correct' | 'wrong';
}

export interface TestResult {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number;
  charsCorrect: number;
  charsWrong: number;
  charsTotal: number;
  duration: number;
  charErrors: Record<string, number>;
  charSubstitutions: Record<string, Record<string, number>>;
  wpmTimeline: number[];
  fingerErrors: Record<string, number>;
  mode: Mode;
  language: Language;
}

interface HookSettings {
  mode: Mode;
  language: Language;
  duration: number;
  wordCount: number;
}

function calcStdDev(arr: number[]): number {
  if (arr.length < 2) return 0;
  const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
  const variance = arr.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / arr.length;
  return Math.sqrt(variance);
}

export function useTypingTest(settings: HookSettings) {
  // Always-current settings via ref — avoids stale closures without adding deps
  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const [words, setWords] = useState<WordState[]>([]);
  const [phase, setPhase] = useState<Phase>('idle');
  // timeLeft meaning varies by mode:
  //   timed: seconds remaining (counts DOWN)
  //   words: words completed (counts UP toward wordCount)
  //   zen:   elapsed seconds (counts UP)
  const [timeLeft, setTimeLeft] = useState(0);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [liveWpm, setLiveWpm] = useState(0);
  const [liveAccuracy, setLiveAccuracy] = useState(100);
  const [result, setResult] = useState<TestResult | null>(null);

  const phaseRef = useRef<Phase>('idle');
  const startTimeRef = useRef<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wpmIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wpmTimelineRef = useRef<number[]>([]);
  const correctCharsRef = useRef(0);
  const totalCharsRef = useRef(0);
  const charErrorsRef = useRef<Record<string, number>>({});
  const charSubsRef = useRef<Record<string, Record<string, number>>>({});

  // Stable initWords — always uses latest settings from ref
  const initWords = useCallback(() => {
    const { language, wordCount } = settingsRef.current;
    const raw = getWordsByLanguage(language, wordCount);
    const wordStates: WordState[] = raw.map(word => ({
      word,
      chars: word.split('').map(c => ({ char: c, status: 'untyped' })),
      status: 'untyped',
    }));
    if (wordStates.length > 0) wordStates[0].status = 'active';
    return wordStates;
  }, []);

  // Stable reset — always uses latest settings from ref
  const reset = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);
    wpmTimelineRef.current = [];
    correctCharsRef.current = 0;
    totalCharsRef.current = 0;
    charErrorsRef.current = {};
    charSubsRef.current = {};
    phaseRef.current = 'idle';

    const { duration, mode } = settingsRef.current;
    // Initial value for timeLeft:
    //   timed → full duration (will count down)
    //   words/zen → 0 (will count up)
    setTimeLeft(isFinite(duration) ? duration : mode === 'words' ? 0 : 0);
    setWords(initWords());
    setPhase('idle');
    setCurrentWordIdx(0);
    setCurrentInput('');
    setLiveWpm(0);
    setLiveAccuracy(100);
    setResult(null);
  }, [initWords]);

  // Initial mount
  useEffect(() => {
    reset();
  }, []);

  const finishTest = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (wpmIntervalRef.current) clearInterval(wpmIntervalRef.current);

    const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
    const correct = correctCharsRef.current;
    const total = totalCharsRef.current;
    const wpm = elapsed > 0 ? Math.round(correct / 5 / elapsed) : 0;
    const rawWpm = elapsed > 0 ? Math.round(total / 5 / elapsed) : 0;
    const accuracy = total > 0 ? parseFloat(((correct / total) * 100).toFixed(1)) : 100;

    const timeline = wpmTimelineRef.current;
    const stdDev = calcStdDev(timeline);
    const mean = timeline.length > 0
      ? timeline.reduce((a, b) => a + b, 0) / timeline.length
      : wpm;
    const consistency = mean > 0
      ? parseFloat(Math.max(0, 100 - (stdDev / mean) * 100).toFixed(1))
      : 100;

    const fingerErrors: Record<string, number> = {};
    Object.entries(charErrorsRef.current).forEach(([char, count]) => {
      const finger = FINGER_MAP[char.toLowerCase()] || 'unknown';
      fingerErrors[finger] = (fingerErrors[finger] || 0) + count;
    });

    const { mode, language, duration } = settingsRef.current;
    const actualDuration = isFinite(duration)
      ? duration
      : Math.round((Date.now() - startTimeRef.current) / 1000);

    setResult({
      wpm, rawWpm, accuracy, consistency,
      charsCorrect: correct,
      charsWrong: total - correct,
      charsTotal: total,
      duration: actualDuration,
      charErrors: { ...charErrorsRef.current },
      charSubstitutions: { ...charSubsRef.current },
      wpmTimeline: [...timeline],
      fingerErrors,
      mode,
      language,
    });
    phaseRef.current = 'done';
    setPhase('done');
  }, []);

  const startTimer = useCallback(() => {
    startTimeRef.current = Date.now();
    phaseRef.current = 'running';
    setPhase('running');

    const { duration, mode } = settingsRef.current;

    if (isFinite(duration)) {
      // Timed modes: countdown
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            finishTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (mode === 'zen') {
      // Zen: count up elapsed seconds
      timerRef.current = setInterval(() => {
        setTimeLeft(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    }
    // Words mode: timer not needed, timeLeft is driven by word completions in handleInput

    // Live WPM every second (all modes)
    wpmIntervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000 / 60;
      if (elapsed > 0) {
        const currentWpm = Math.round(correctCharsRef.current / 5 / elapsed);
        wpmTimelineRef.current.push(currentWpm);
        setLiveWpm(currentWpm);
        const acc = totalCharsRef.current > 0
          ? parseFloat(((correctCharsRef.current / totalCharsRef.current) * 100).toFixed(1))
          : 100;
        setLiveAccuracy(acc);
      }
    }, 1000);
  }, [finishTest]);

  // Undo last word (Ctrl+Z) — visual only, doesn't reverse stat counters
  const undoWord = useCallback(() => {
    if (phaseRef.current === 'done') return;
    setCurrentWordIdx(prev => {
      if (prev === 0) return prev;
      const prevIdx = prev - 1;
      setWords(ws => {
        const updated = [...ws];
        updated[prevIdx] = {
          ...updated[prevIdx],
          chars: updated[prevIdx].word.split('').map(c => ({ char: c, status: 'untyped' })),
          status: 'active',
        };
        return updated;
      });
      setCurrentInput('');
      return prevIdx;
    });
  }, []);

  const handleInput = useCallback((value: string) => {
    if (phaseRef.current === 'done') return;

    setWords(prev => {
      const wordIdx = currentWordIdx;
      if (wordIdx >= prev.length) return prev;

      const updated = [...prev];
      const word: WordState = {
        ...prev[wordIdx],
        chars: prev[wordIdx].chars.map(c => ({ ...c })),
      };
      updated[wordIdx] = word;

      if (phaseRef.current === 'idle' && value.length > 0) {
        startTimer();
      }

      // Space pressed — complete the word
      if (value.endsWith(' ')) {
        const typed = value.trimEnd();
        for (let i = 0; i < word.word.length; i++) {
          if (i < typed.length) {
            word.chars[i].status = typed[i] === word.word[i] ? 'correct' : 'wrong';
          } else {
            word.chars[i].status = 'wrong';
          }
        }
        word.status = typed === word.word ? 'correct' : 'wrong';

        // Track skipped chars
        const skipped = word.word.length - typed.length;
        if (skipped > 0) {
          for (let i = typed.length; i < word.word.length; i++) {
            const expected = word.word[i];
            charErrorsRef.current[expected] = (charErrorsRef.current[expected] || 0) + 1;
            totalCharsRef.current += 1;
          }
        }

        const nextIdx = wordIdx + 1;
        if (nextIdx < updated.length) {
          updated[nextIdx] = { ...updated[nextIdx], status: 'active' };
        }

        // Words mode: advance progress counter and check completion
        if (settingsRef.current.mode === 'words') {
          setTimeLeft(nextIdx);
          if (nextIdx >= settingsRef.current.wordCount) {
            setTimeout(() => finishTest(), 0);
          }
        }

        setCurrentWordIdx(nextIdx);
        setCurrentInput('');
        return updated;
      }

      // Regular character typing
      word.chars = word.word.split('').map((c, i) => {
        if (i < value.length) {
          return { char: c, status: value[i] === c ? 'correct' : 'wrong' };
        }
        return { char: c, status: 'untyped' };
      });

      // Track the last typed character for stats
      const prevLen = currentInput.length;
      const newLen = value.length;
      if (newLen > prevLen) {
        const charIdx = newLen - 1;
        const expected = word.word[charIdx] ?? '';
        const typed = value[charIdx];
        const correct = typed === expected;

        totalCharsRef.current += 1;
        if (correct) {
          correctCharsRef.current += 1;
        } else {
          charErrorsRef.current[expected] = (charErrorsRef.current[expected] || 0) + 1;
          if (expected) {
            if (!charSubsRef.current[expected]) charSubsRef.current[expected] = {};
            charSubsRef.current[expected][typed] = (charSubsRef.current[expected][typed] || 0) + 1;
          }
        }
      }

      setCurrentInput(value);
      return updated;
    });
  }, [currentWordIdx, currentInput, startTimer, finishTest]);

  return {
    words,
    phase,
    timeLeft,
    currentWordIdx,
    currentInput,
    liveWpm,
    liveAccuracy,
    result,
    handleInput,
    reset,
    undoWord,
    DURATION: settingsRef.current.duration,
  };
}
