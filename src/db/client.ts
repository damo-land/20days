import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as SQLite from 'expo-sqlite';
import * as schema from './schema';

const expoDb = SQLite.openDatabaseSync('twentydays.db');

export const db = drizzle(expoDb, { schema });

/**
 * Bootstrap tables. Idempotent (CREATE TABLE IF NOT EXISTS) so it can run on every
 * launch. For a shipping app this should move to Drizzle migrations (drizzle-kit);
 * kept inline here to keep the scaffold runnable without a migration step.
 */
export function initDb(): void {
  expoDb.execSync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS pillars (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      sort_order INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      archived_at INTEGER
    );

    CREATE TABLE IF NOT EXISTS entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pillar_id INTEGER NOT NULL REFERENCES pillars(id),
      date TEXT NOT NULL,
      score REAL NOT NULL,
      scale_version INTEGER NOT NULL DEFAULT 1,
      note TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );
    CREATE UNIQUE INDEX IF NOT EXISTS uniq_pillar_date ON entries(pillar_id, date);

    CREATE TABLE IF NOT EXISTS priorities_revisions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      snapshot_json TEXT NOT NULL,
      reason TEXT,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS verdict_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      triggered_at INTEGER NOT NULL DEFAULT (unixepoch()),
      trigger_reason TEXT,
      window_start TEXT,
      window_end TEXT,
      user_action TEXT,
      cooldown_until INTEGER,
      reflection TEXT
    );
  `);
  // Additive column migration for DBs created before `reflection` existed. CREATE TABLE
  // IF NOT EXISTS can't add a column to an existing table, so ALTER and swallow the
  // "duplicate column" error that fires once the column is already present.
  addColumnIfMissing('verdict_events', 'reflection', 'TEXT');
}

/** Idempotent single-column add. Safe to call on every launch (throws → column exists → ignore). */
function addColumnIfMissing(table: string, column: string, type: string): void {
  const exists = expoDb
    .getAllSync<{ name: string }>(`PRAGMA table_info(${table})`)
    .some((c) => c.name === column);
  if (!exists) expoDb.execSync(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
}
