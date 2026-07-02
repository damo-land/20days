/**
 * Score → colour, used on both the check-in and the trend rings/chart. The colour reflects the
 * *rating* and shifts with the value: low warms to ochre, high cools to teal (the brand trend
 * scale, 1→5). Same mapping everywhere so a score reads the same colour throughout the app.
 */
const SCORE_SCALE = ['#E85D2C', '#F58A2E', '#EBBB3F', '#4FB06A', '#16A085']; // 1 declining → 5 rising (mirrors TREND_SCALE, saturated round)
export function scoreColor(value: number | null): string {
  if (value == null) return '#A79470'; // neutral sand
  return SCORE_SCALE[Math.max(1, Math.min(5, Math.round(value))) - 1];
}

/** Middle of the 1–5 scale — the check-in starts here so the user just nudges from neutral. */
export const DEFAULT_SCORE = 3;
