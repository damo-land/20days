import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { useAppStore } from '@/state/store';
import { buildTheme } from './theme';

/** Wraps the app in the 20days theme — fixed warm neutrals, accent follows the current trend. */
export function AppThemeProvider({ children }: { children: ReactNode }) {
  const scheme = useColorScheme();
  const trendState = useAppStore((s) => s.trendState);
  const dark = scheme === 'dark';
  const theme = useMemo(() => buildTheme(trendState, dark), [trendState, dark]);
  return <PaperProvider theme={theme}>{children}</PaperProvider>;
}
