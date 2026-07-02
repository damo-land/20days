import type { DatedNote } from './types';

/**
 * Pick which notes to quote at the checkpoint. When a user journals a lot, quoting the last few
 * days isn't enough — the story usually lives on the days the *sliding* pillars scored lowest.
 * So we rank the user's own note-days by how rough that day was for what's declining, newest
 * first to break ties, and take the top few.
 *
 * Purely deterministic and extractive (verbatim, never rephrased). This is the always-available
 * floor; the on-device model can later re-rank by meaning, but it must never invent or reword.
 */
export function selectRelevantNotes(
  notes: DatedNote[],
  pillarRows: { pillarId: number; date: string; score: number }[],
  slidingIds: number[],
  limit = 3,
): DatedNote[] {
  const relevant = slidingIds.length ? new Set(slidingIds) : null; // no sliding pillar → rank by ALL pillars
  const dayScore = new Map<string, { total: number; count: number }>();
  for (const r of pillarRows) {
    if (relevant && !relevant.has(r.pillarId)) continue;
    const cur = dayScore.get(r.date) ?? { total: 0, count: 0 };
    cur.total += r.score;
    cur.count += 1;
    dayScore.set(r.date, cur);
  }
  // Lower day-score = rougher day for what's sliding = more relevant to surface. A note-day with
  // no sliding-pillar score ranks last (Infinity), so we never bury a rough day behind a bland one.
  const scoreFor = (date: string) => {
    const a = dayScore.get(date);
    return a ? a.total / a.count : Infinity;
  };
  return [...notes]
    .sort((a, b) => scoreFor(a.date) - scoreFor(b.date) || (a.date < b.date ? 1 : -1))
    .slice(0, limit);
}
