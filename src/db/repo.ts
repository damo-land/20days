import { and, desc, eq, gte, isNotNull } from 'drizzle-orm';
import { db } from './client';
import { entries, pillars, prioritiesRevisions, verdictEvents, type Entry, type Pillar } from './schema';
import type { ScoreRow } from '@/trend/series';

const nowSec = () => Math.floor(Date.now() / 1000);

// ---- Pillars ----------------------------------------------------------------

export function listPillars(): Pillar[] {
  return db.select().from(pillars).orderBy(pillars.sortOrder).all();
}

export function createInitialPillars(names: string[]): void {
  names.forEach((name, i) => db.insert(pillars).values({ name, sortOrder: i }).run());
  snapshotPriorities('onboarding');
}

export function updatePillar(id: number, patch: { name?: string; description?: string | null }): void {
  db.update(pillars).set(patch).where(eq(pillars.id, id)).run();
}

/** Append the current pillar definition to history ("priorities change over time"). */
export function snapshotPriorities(reason: string): void {
  const current = listPillars();
  db.insert(prioritiesRevisions).values({ snapshotJson: JSON.stringify(current), reason }).run();
}

// ---- Entries ----------------------------------------------------------------

export function getEntriesForDate(date: string): Entry[] {
  return db.select().from(entries).where(eq(entries.date, date)).all();
}

export function upsertEntry(row: {
  pillarId: number;
  date: string;
  score: number;
  note?: string | null;
  scaleVersion?: number;
}): void {
  const note = row.note ?? null;
  const scaleVersion = row.scaleVersion ?? 1;
  db.insert(entries)
    .values({ pillarId: row.pillarId, date: row.date, score: row.score, note, scaleVersion })
    .onConflictDoUpdate({
      target: [entries.pillarId, entries.date],
      set: { score: row.score, note, scaleVersion },
    })
    .run();
}

/** Score rows since `sinceISO` (inclusive). ISO dates compare correctly as strings. */
export function getScoreRowsSince(sinceISO: string): ScoreRow[] {
  return db
    .select({ date: entries.date, score: entries.score })
    .from(entries)
    .where(gte(entries.date, sinceISO))
    .all();
}

/** Per-pillar score rows since `sinceISO` — used to derive each pillar's latest score (rings). */
export function getPillarScoreRowsSince(sinceISO: string): { pillarId: number; date: string; score: number }[] {
  return db
    .select({ pillarId: entries.pillarId, date: entries.date, score: entries.score })
    .from(entries)
    .where(gte(entries.date, sinceISO))
    .all();
}

/**
 * Most recent notes in the window, newest first — the user's own words for the Verdict screen
 * (recall is peak-end biased; what they wrote at the time is the honest record). Deduped by day:
 * a day's note is stored on every pillar entry.
 */
export function getNotesSince(sinceISO: string, limit = 3): { date: string; note: string }[] {
  const rows = db
    .select({ date: entries.date, note: entries.note })
    .from(entries)
    .where(and(gte(entries.date, sinceISO), isNotNull(entries.note)))
    .orderBy(desc(entries.date))
    .all();
  const out: { date: string; note: string }[] = [];
  for (const r of rows) {
    if (r.note && !out.some((o) => o.date === r.date)) out.push({ date: r.date, note: r.note });
    if (out.length >= limit) break;
  }
  return out;
}

// ---- Verdict events ---------------------------------------------------------

export function recordVerdict(v: {
  reason: string;
  windowStart: string;
  windowEnd: string;
  userAction: 'ignore' | 'adjust' | 'support';
  cooldownUntilMs: number;
}): void {
  db.insert(verdictEvents)
    .values({
      triggeredAt: nowSec(),
      triggerReason: v.reason,
      windowStart: v.windowStart,
      windowEnd: v.windowEnd,
      userAction: v.userAction,
      cooldownUntil: v.cooldownUntilMs,
    })
    .run();
}
