/**
 * Trend engine — PURE TypeScript, no React Native imports, so it stays unit-testable.
 *
 * Evidence & rationale: docs/RESEARCH.md §2 and docs/SPEC.md §2.
 * Everything here is a DESIGN DECISION with provisional thresholds — validate on real/pilot data.
 * Key guards from the research: single-item daily scores are noisy, so we (a) require a
 * minimum number of logged days, (b) use a robust (Theil–Sen) slope, and (c) gate on
 * magnitude relative to the series' own spread, not just slope direction — to suppress
 * false alarms that erode trust and can feed rumination.
 */

export type TrendState = 'insufficient' | 'improving' | 'stable' | 'declining';

export interface DayPoint {
  date: string; // yyyy-mm-dd
  value: number | null; // null = no entry that day
}

export interface TrendConfig {
  windowDays: number; // rolling window length
  minLoggedDays: number; // need at least this many logged days in the window
  declineMagnitudeSd: number; // projected change must exceed this × series SD…
  magnitudeFloor: number; // …or this absolute floor, whichever is larger
  cooldownDays: number; // suppress re-triggering for this long after a verdict
}

export const DEFAULT_TREND_CONFIG: TrendConfig = {
  windowDays: 20,
  minLoggedDays: 14,
  declineMagnitudeSd: 1.0,
  // Absolute floor on the projected net change, in score units. `declineMagnitudeSd` is
  // SD-relative and auto-scales, but this floor is tied to the scale span, so it was
  // re-derived proportionally when the scale shrank 0–10 → 1–5: 0.5 × (4/10) ≈ 0.2.
  magnitudeFloor: 0.2,
  cooldownDays: 14,
};

export interface TrendResult {
  state: TrendState;
  slopePerDay: number; // units of score per calendar day
  projectedChange: number; // slope × (window span) — net change across the window
  loggedDays: number;
  mean: number;
  sd: number;
}

function median(xs: number[]): number {
  if (xs.length === 0) return 0;
  const s = [...xs].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

/** Robust slope: median of all pairwise slopes. Resistant to noisy single-item outliers. */
export function theilSenSlope(pts: { x: number; y: number }[]): number {
  const slopes: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[j].x - pts[i].x;
      if (dx !== 0) slopes.push((pts[j].y - pts[i].y) / dx);
    }
  }
  return median(slopes);
}

function stdDev(xs: number[], mean: number): number {
  if (xs.length < 2) return 0;
  const v = xs.reduce((acc, x) => acc + (x - mean) ** 2, 0) / (xs.length - 1);
  return Math.sqrt(v);
}

/**
 * Detect the trend over a window. `points` should be the last `windowDays` calendar days
 * (oldest first); gaps are represented by value === null and advance the x-axis so slope
 * reflects real elapsed time, not just logged-sample order.
 */
export function detectTrend(points: DayPoint[], cfg: TrendConfig = DEFAULT_TREND_CONFIG): TrendResult {
  const span = Math.max(points.length - 1, 1);
  const logged: { x: number; y: number }[] = [];
  points.forEach((p, i) => {
    if (p.value != null) logged.push({ x: i, y: p.value });
  });

  const values = logged.map((p) => p.y);
  const mean = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;
  const sd = stdDev(values, mean);
  const loggedDays = logged.length;

  if (loggedDays < cfg.minLoggedDays) {
    return { state: 'insufficient', slopePerDay: 0, projectedChange: 0, loggedDays, mean, sd };
  }

  const slope = theilSenSlope(logged);
  const projectedChange = slope * span;
  const threshold = Math.max(cfg.declineMagnitudeSd * sd, cfg.magnitudeFloor);

  let state: TrendState = 'stable';
  if (projectedChange <= -threshold) state = 'declining';
  else if (projectedChange >= threshold) state = 'improving';

  return { state, slopePerDay: slope, projectedChange, loggedDays, mean, sd };
}

/**
 * Should the Verdict Day fire? Declining + enough data + not within the cooldown window.
 * `nowMs` and `lastVerdictAtMs` are epoch milliseconds (pass them in to keep this pure).
 */
export function shouldTriggerVerdict(
  result: TrendResult,
  lastVerdictAtMs: number | null,
  nowMs: number,
  cfg: TrendConfig = DEFAULT_TREND_CONFIG,
): boolean {
  if (result.state !== 'declining') return false;
  if (result.loggedDays < cfg.minLoggedDays) return false;
  if (lastVerdictAtMs != null && nowMs - lastVerdictAtMs < cfg.cooldownDays * 86_400_000) return false;
  return true;
}
