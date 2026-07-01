import { create } from 'zustand';
import type { TrendResult, TrendState } from '@/trend/engine';

interface AppState {
  trendState: TrendState;
  trend: TrendResult | null;
  verdictReady: boolean;
  /** Expressiveness dial ∈ [0,1] (grounded → relaxed); drives M3-Expressive motion/shape/tone. */
  dial: number;
  setTrend: (result: TrendResult, verdictReady: boolean, dial: number) => void;
  /** Active wipe-transition colours (rendered as a root overlay so it survives the route change). */
  wipeColors: string[] | null;
  startWipe: (colors: string[]) => void;
  endWipe: () => void;
  /** Pillars editor sheet (lives on Trend) — a flag so Verdict's "adjust" door can open it after closing. */
  pillarsOpen: boolean;
  setPillarsOpen: (open: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
  trendState: 'insufficient',
  trend: null,
  verdictReady: false,
  dial: 0.5,
  setTrend: (result, verdictReady, dial) => set({ trend: result, trendState: result.state, verdictReady, dial }),
  wipeColors: null,
  startWipe: (colors) => set({ wipeColors: colors }),
  endWipe: () => set({ wipeColors: null }),
  pillarsOpen: false,
  setPillarsOpen: (open) => set({ pillarsOpen: open }),
}));
