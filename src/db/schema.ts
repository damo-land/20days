import { sql } from 'drizzle-orm';
import { integer, real, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';

/** The user's 3 life pillars. Editable; history of edits kept in `prioritiesRevisions`. */
export const pillars = sqliteTable('pillars', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  description: text('description'),
  sortOrder: integer('sort_order').notNull().default(0),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  archivedAt: integer('archived_at'),
});

/** One score per pillar per local day. Upsert on (pillarId, date). */
export const entries = sqliteTable(
  'entries',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    pillarId: integer('pillar_id')
      .notNull()
      .references(() => pillars.id),
    date: text('date').notNull(), // yyyy-mm-dd, local day
    score: real('score').notNull(),
    scaleVersion: integer('scale_version').notNull().default(1),
    note: text('note'),
    createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
  },
  (t) => [uniqueIndex('uniq_pillar_date').on(t.pillarId, t.date)],
);

/** Append-only history of the 3-pillar definition ("priorities change over time"). */
export const prioritiesRevisions = sqliteTable('priorities_revisions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  snapshotJson: text('snapshot_json').notNull(),
  reason: text('reason'),
  createdAt: integer('created_at').notNull().default(sql`(unixepoch())`),
});

/** Record of each Verdict Day trigger and what the user chose. */
export const verdictEvents = sqliteTable('verdict_events', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  triggeredAt: integer('triggered_at').notNull().default(sql`(unixepoch())`),
  triggerReason: text('trigger_reason'),
  windowStart: text('window_start'),
  windowEnd: text('window_end'),
  userAction: text('user_action'), // 'ignore' | 'adjust' | 'support'
  cooldownUntil: integer('cooldown_until'),
  reflection: text('reflection'), // the user's own optional written response at the checkpoint (local-only)
});

export type Pillar = typeof pillars.$inferSelect;
export type Entry = typeof entries.$inferSelect;
