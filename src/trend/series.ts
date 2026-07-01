import { lastNDates } from '@/lib/date';
import type { DayPoint } from './engine';

export interface ScoreRow {
  date: string; // yyyy-mm-dd
  score: number;
}

/**
 * Build a daily composite series (one value per calendar day) from raw score rows.
 * A day's value is the mean of all pillar scores logged that day; days with no entries
 * are null. Pure so it can be unit-tested; pass `endISO` rather than reading the clock.
 */
export function buildDailySeries(rows: ScoreRow[], days: number, endISO: string): DayPoint[] {
  const sums = new Map<string, { total: number; count: number }>();
  for (const r of rows) {
    const cur = sums.get(r.date) ?? { total: 0, count: 0 };
    cur.total += r.score;
    cur.count += 1;
    sums.set(r.date, cur);
  }
  return lastNDates(days, endISO).map((date) => {
    const agg = sums.get(date);
    return { date, value: agg ? agg.total / agg.count : null };
  });
}
