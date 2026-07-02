import { describe, expect, it } from 'vitest';
import { selectRelevantNotes } from './notes';
import type { DatedNote } from './types';

const notes: DatedNote[] = [
  { date: '2026-06-12', note: 'C' },
  { date: '2026-06-11', note: 'B' },
  { date: '2026-06-10', note: 'A' },
];
// Sliding pillar id 1 scored lowest on the 11th; pillar 2 is noise the ranker should ignore.
const rows = [
  { pillarId: 1, date: '2026-06-10', score: 5 },
  { pillarId: 1, date: '2026-06-11', score: 2 },
  { pillarId: 1, date: '2026-06-12', score: 4 },
  { pillarId: 2, date: '2026-06-11', score: 5 },
];

describe('selectRelevantNotes', () => {
  it('surfaces the note from the sliding pillar’s worst day first', () => {
    const out = selectRelevantNotes(notes, rows, [1]);
    expect(out[0].date).toBe('2026-06-11'); // score 2 — the roughest day for what is sliding
  });

  it('respects the limit', () => {
    expect(selectRelevantNotes(notes, rows, [1], 2)).toHaveLength(2);
  });

  it('breaks ties by recency (newer first)', () => {
    const tied = [
      { pillarId: 1, date: '2026-06-11', score: 2 },
      { pillarId: 1, date: '2026-06-12', score: 2 },
    ];
    const out = selectRelevantNotes(notes.slice(0, 2), tied, [1]);
    expect(out[0].date).toBe('2026-06-12');
  });

  it('ranks a note-day with no sliding-pillar score last', () => {
    const withOrphan = [...notes, { date: '2026-06-09', note: 'orphan' }];
    const out = selectRelevantNotes(withOrphan, rows, [1], 4); // limit 4 so the orphan isn't sliced off
    expect(out[out.length - 1].date).toBe('2026-06-09');
  });

  it('ranks by all pillars when nothing is sliding', () => {
    const out = selectRelevantNotes(notes, rows, []); // relevant = null → uses every pillar row
    expect(out).toHaveLength(3);
    expect(out.map((n) => n.date)).toContain('2026-06-11');
  });
});
