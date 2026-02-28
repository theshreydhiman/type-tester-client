import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Language } from '../utils/words';

export type Mode = '15' | '30' | '60' | 'words' | 'zen';
export { type Language };

interface TestSettings {
  mode: Mode;
  language: Language;
  setMode: (m: Mode) => void;
  setLanguage: (l: Language) => void;
  duration: number;      // seconds; Infinity for non-timed modes
  wordCount: number;     // 25 for words mode, 200 otherwise
  isTimedMode: boolean;
}

const DURATION_MAP: Record<Mode, number> = {
  '15': 15,
  '30': 30,
  '60': 60,
  'words': Infinity,
  'zen': Infinity,
};

const WORD_COUNT_MAP: Record<Mode, number> = {
  '15': 200,
  '30': 200,
  '60': 200,
  'words': 25,
  'zen': 200,
};

const TestSettingsContext = createContext<TestSettings>({
  mode: '30',
  language: 'english',
  setMode: () => {},
  setLanguage: () => {},
  duration: 30,
  wordCount: 200,
  isTimedMode: true,
});

export function TestSettingsProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>('30');
  const [language, setLanguage] = useState<Language>('english');

  return (
    <TestSettingsContext.Provider
      value={{
        mode,
        language,
        setMode,
        setLanguage,
        duration: DURATION_MAP[mode],
        wordCount: WORD_COUNT_MAP[mode],
        isTimedMode: mode === '15' || mode === '30' || mode === '60',
      }}
    >
      {children}
    </TestSettingsContext.Provider>
  );
}

export function useTestSettings() {
  return useContext(TestSettingsContext);
}
