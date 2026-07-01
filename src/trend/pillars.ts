import { DEFAULT_TREND_CONFIG, detectTrend, type DayPoint, type TrendState } from './engine';
import { buildDailySeries, type ScoreRow } from './series';

export interface PillarTrend {
  pillarId: number;
  name: string;
  points: DayPoint[];
  state: TrendState;
}

/**
 * Per-pillar trend — the brand shows each pillar's direction in its own trend colour
 * (Guidelines §06). Pure glue over the tested `detectTrend`, run once per pillar.
 */
export function buildPillarTrends(
  rows: { pillarId: number; date: string; score: number }[],
  pillars: { id: number; name: string }[],
  days: number,
  endISO: string,
): PillarTrend[] {
  return pillars.map((p) => {
    const own: ScoreRow[] = rows.filter((r) => r.pillarId === p.id).map((r) => ({ date: r.date, score: r.score }));
    const points = buildDailySeries(own, days, endISO);
    return { pillarId: p.id, name: p.name, points, state: detectTrend(points, DEFAULT_TREND_CONFIG).state };
  });
}

/** Pillars whose own trend is declining — lets the checkpoint name what's actually sliding. */
export function decliningPillars(trends: PillarTrend[]): string[] {
  return trends.filter((t) => t.state === 'declining').map((t) => t.name);
}

/** "A", "A and B", "A, B and C" — how pillar names read in a sentence. */
export function joinNames(names: string[]): string {
  return names.length <= 1 ? (names[0] ?? '') : `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}`;
}

/**
 * One calm, personal reading of the window, in the user's own pillar names. Direction first
 * (their per-pillar trends), steadiness as the quiet default. Null when there's nothing real
 * to say (not enough data) — never invents a story.
 */
export function pillarHighlight(trends: PillarTrend[]): string | null {
  const known = trends.filter((t) => t.state !== 'insufficient');
  if (known.length === 0) return null;

  const valuesOf = (t: PillarTrend) => t.points.filter((p) => p.value != null).map((p) => p.value as number);
  const avgOf = (t: PillarTrend) => {
    const vals = valuesOf(t);
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  const sliding = known.filter((t) => t.state === 'declining').map((t) => t.name);
  if (sliding.length) return `${joinNames(sliding)} ${sliding.length === 1 ? 'has' : 'have'} been sliding lately.`;

  // "On the way up" must match what the chart shows NOW: an improving window slope whose
  // latest score fell back below the pillar's own average reads as a dip, not a climb.
  const climbing = known
    .filter((t) => {
      if (t.state !== 'improving') return false;
      const vals = valuesOf(t);
      return vals[vals.length - 1] >= avgOf(t);
    })
    .map((t) => t.name);
  if (climbing.length) return `${joinNames(climbing)} ${climbing.length === 1 ? 'is' : 'are'} on the way up.`;

  // Steadiness is only a story when every pillar really is stable (and none still warming up).
  if (known.length < trends.length || !known.every((t) => t.state === 'stable')) return null;
  const ranked = [...known].sort((a, b) => avgOf(b) - avgOf(a));
  if (avgOf(ranked[0]) - avgOf(ranked[ranked.length - 1]) >= 0.5) {
    return `${ranked[0].name} has been your steadiest.`;
  }
  return 'All three holding steady.';
}
