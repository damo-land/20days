/**
 * Pillar-edit diff — PURE TypeScript, no RN imports, so it stays unit-testable.
 *
 * The picker hands back the 3 chosen names in slot order; this classifies them against the
 * active pillars. A name that matches an existing pillar keeps that row — id and entry
 * history intact — wherever it now sits, because matching is by trimmed exact name, never
 * by index (the picker reorders its array on every deselect/select). Anything else is a
 * replacement: the old pillar is archived (history kept in the DB, hidden from the UI) and
 * a brand-new row is created — a swapped-in pillar must never inherit the old one's data.
 * Matching is case-sensitive: a case change reads as a swap, the safe direction (fresh start).
 */
export interface PillarEdit {
  kept: { id: number; name: string; sortOrder: number }[]; // existing rows that stay, at their new positions
  archived: number[]; // pillar ids to archive (fresh-start rule)
  created: { name: string; sortOrder: number }[]; // brand-new pillars, zero history
  changed: boolean; // anything to persist at all (false = pure no-op save)
  replaced: boolean; // any archive/create (not a pure reorder) — restarts the verdict cooldown
}

export function diffPillarEdit(current: { id: number; name: string }[], selectedNames: string[]): PillarEdit {
  const selected = selectedNames.map((n) => n.trim()).filter((n) => n.length > 0);
  const byName = new Map(current.map((p) => [p.name.trim(), p]));

  const kept: PillarEdit['kept'] = [];
  const created: PillarEdit['created'] = [];
  selected.forEach((name, i) => {
    const match = byName.get(name);
    if (match) {
      byName.delete(name); // consume the match so a duplicate name can't claim the same row twice
      kept.push({ id: match.id, name, sortOrder: i });
    } else {
      created.push({ name, sortOrder: i });
    }
  });

  const archived = [...byName.values()].map((p) => p.id);
  const replaced = created.length > 0 || archived.length > 0;
  const changed =
    replaced || selected.length !== current.length || selected.some((n, i) => n !== current[i].name.trim());
  return { kept, archived, created, changed, replaced };
}
