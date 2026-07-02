import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { PaperProvider } from 'react-native-paper';
import { useAppStore } from '@/state/store';
import { buildTheme } from './theme';

/**
 * Wraps the app in the 20days theme — fixed warm neutrals, accent follows the current trend.
 * The brand is the warm Cream/Ink light palette, locked: system dark mode is deliberately
 * ignored (a dark system scheme turned the whole app Ink-on-Ink on device).
 */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const trendState = useAppStore((s) => s.trendState);
  const theme = useMemo(() => buildTheme(trendState, false), [trendState]);
  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}
