import type { ReactNode } from 'react';
import { createContext, useContext, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { tones, type Tones } from './brand';
import { buildTheme } from './theme';

const TonesContext = createContext<Tones>(tones(false));

/** The Full Stop tokens for the current mode — the primary styling handle app-wide. */
export function useTones(): Tones {
  return useContext(TonesContext);
}

/**
 * Ink on Paper, either way round (docs/DESIGN.md §2): the system scheme picks the mode and
 * everything swaps wholesale. No trend-driven chrome colour any more — the trend speaks
 * through words and dots.
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const dark = useColorScheme() === 'dark';
  const theme = useMemo(() => buildTheme(dark), [dark]);
  const t = useMemo(() => tones(dark), [dark]);
  return (
    <TonesContext.Provider value={t}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </TonesContext.Provider>
  );
}
