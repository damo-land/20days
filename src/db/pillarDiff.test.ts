import { describe, expect, it } from 'vitest';
import { diffPillarEdit } from './pillarDiff';

const current = [
  { id: 1, name: 'Health' },
  { id: 2, name: 'Work' },
  { id: 3, name: 'Love' },
];

describe('diffPillarEdit', () => {
  it('treats the same names in the same order as a no-op', () => {
    const edit = diffPillarEdit(current, ['Health', 'Work', 'Love']);
    expect(edit.changed).toBe(false);
    expect(edit.replaced).toBe(false);
    expect(edit.archived).toEqual([]);
    expect(edit.created).toEqual([]);
  });

  it('treats a pure reorder as changed but not replaced', () => {
    const edit = diffPillarEdit(current, ['Love', 'Health', 'Work']);
    expect(edit.changed).toBe(true);
    expect(edit.replaced).toBe(false);
    expect(edit.kept).toEqual([
      { id: 3, name: 'Love', sortOrder: 0 },
      { id: 1, name: 'Health', sortOrder: 1 },
      { id: 2, name: 'Work', sortOrder: 2 },
    ]);
    expect(edit.archived).toEqual([]);
    expect(edit.created).toEqual([]);
  });

  it('archives + creates on a single same-slot swap', () => {
    const edit = diffPillarEdit(current, ['Health', 'Fitness', 'Love']);
    expect(edit.replaced).toBe(true);
    expect(edit.kept).toEqual([
      { id: 1, name: 'Health', sortOrder: 0 },
      { id: 3, name: 'Love', sortOrder: 2 },
    ]);
    expect(edit.archived).toEqual([2]);
    expect(edit.created).toEqual([{ name: 'Fitness', sortOrder: 1 }]);
  });

  it('keeps an unrelated pillar with its own id when the picker shifts it mid-array', () => {
    // Deselect Work, add Fitness → the picker yields [Health, Love, Fitness]. Love must keep
    // id 3 (its history) despite moving index — the exact corruption index-mapping caused.
    const edit = diffPillarEdit(current, ['Health', 'Love', 'Fitness']);
    expect(edit.kept).toEqual([
      { id: 1, name: 'Health', sortOrder: 0 },
      { id: 3, name: 'Love', sortOrder: 1 },
    ]);
    expect(edit.archived).toEqual([2]);
    expect(edit.created).toEqual([{ name: 'Fitness', sortOrder: 2 }]);
  });

  it('handles a multi swap', () => {
    const edit = diffPillarEdit(current, ['Health', 'Fitness', 'Friends']);
    expect(edit.kept).toEqual([{ id: 1, name: 'Health', sortOrder: 0 }]);
    expect(edit.archived).toEqual([2, 3]);
    expect(edit.created).toEqual([
      { name: 'Fitness', sortOrder: 1 },
      { name: 'Friends', sortOrder: 2 },
    ]);
  });

  it('archives everything when all three are swapped', () => {
    const edit = diffPillarEdit(current, ['Sleep', 'Money', 'Fun']);
    expect(edit.kept).toEqual([]);
    expect(edit.archived).toEqual([1, 2, 3]);
    expect(edit.created.map((c) => c.name)).toEqual(['Sleep', 'Money', 'Fun']);
  });

  it('ignores surrounding whitespace when matching names', () => {
    const edit = diffPillarEdit(current, [' Health ', 'Work', 'Love']);
    expect(edit.changed).toBe(false);
    expect(edit.replaced).toBe(false);
  });

  it('never lets a duplicate name claim the same row twice, and keeps the size invariants', () => {
    const edit = diffPillarEdit(current, ['Health', 'Health', 'Fun']);
    expect(edit.kept).toEqual([{ id: 1, name: 'Health', sortOrder: 0 }]);
    expect(edit.kept.length + edit.created.length).toBe(3);
    expect(edit.kept.length + edit.archived.length).toBe(current.length);
  });
});
