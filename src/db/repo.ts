import { and, desc, eq, gte, isNotNull, isNull } from 'drizzle-orm';
import { db } from './client';
import { entries, pillars, prioritiesRevisions, verdictEvents, type Entry, type Pillar } from './schema';
import { diffPillarEdit, type PillarEdit } from './pillarDiff';
import { SCALE } from '@/config';
import type { ScoreRow } from '@/trend/series';

const nowSec = () => Math.floor(Date.now() / 1000);

// ---- Pillars ----------------------------------------------------------------

/** The active 3 pillars. Archived ones keep their entry history but never surface in the UI. */
export function listPillars(): Pillar[] {
  return db.select().from(pillars).where(isNull(pillars.archivedAt)).orderBy(pillars.sortOrder).all();
}

export function createInitialPillars(names: string[]): void {
  if (listPillars().length) return; // idempotent — a double-tap on onboarding must not duplicate pillars
  names.forEach((name, i) => db.insert(pillars).values({ name, sortOrder: i }).run());
  snapshotPriorities('onboarding');
}

/**
 * Apply a 3-name selection from the picker: names that match keep their row (id + history,
 * reordered as needed); the rest are archived and replaced by brand-new rows with zero
 * history. Diffs against fresh DB state and returns the edit so callers can branch on
 * `changed` / `replaced` (a replacement restarts the verdict cooldown).
 */
export function applyPillarEdit(selectedNames: string[]): PillarEdit {
  const edit = diffPillarEdit(listPillars(), selectedNames);
  if (!edit.changed) return edit;
  const archivedAt = nowSec();
  db.transaction(() => {
    edit.kept.forEach((k) => db.update(pillars).set({ sortOrder: k.sortOrder }).where(eq(pillars.id, k.id)).run());
    edit.archived.forEach((id) => db.update(pillars).set({ archivedAt }).where(eq(pillars.id, id)).run());
    edit.created.forEach((c) => db.insert(pillars).values({ name: c.name, sortOrder: c.sortOrder }).run());
    // Snapshot AFTER the changes so priorities_revisions records the new definition. The sync
    // driver shares one connection, so these module-level `db` calls join the open transaction.
    snapshotPriorities('edited pillars');
  });
  return edit;
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
  const scaleVersion = row.scaleVersion ?? SCALE.version;
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

/**
 * Epoch ms of the most recent verdict/pillar-change event — verdict_events is the single
 * source of truth for the cooldown. `triggered_at` is stored in SECONDS; the engine
 * compares MILLISECONDS, so the ×1000 is load-bearing.
 */
export function getLastVerdictAtMs(): number | null {
  const row = db
    .select({ t: verdictEvents.triggeredAt })
    .from(verdictEvents)
    .orderBy(desc(verdictEvents.triggeredAt))
    .limit(1)
    .get();
  return row ? row.t * 1000 : null;
}

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
