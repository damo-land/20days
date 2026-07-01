import { describe, expect, it } from 'vitest';
import type { DayPoint, TrendState } from './engine';
import { decliningPillars, pillarHighlight, type PillarTrend } from './pillars';

function flat(value: number | null, days = 14): DayPoint[] {
  return Array.from({ length: days }, (_, i) => ({ date: `2026-06-${String(i + 1).padStart(2, '0')}`, value }));
}

function pillar(name: string, state: TrendState, value: number | null = 3): PillarTrend {
  return { pillarId: name.length, name, state, points: flat(value) };
}

function pillarWith(name: string, state: TrendState, values: number[]): PillarTrend {
  const points: DayPoint[] = values.map((v, i) => ({ date: `2026-06-${String(i + 1).padStart(2, '0')}`, value: v }));
  return { pillarId: name.length, name, state, points };
}

describe('decliningPillars', () => {
  it('returns only the declining pillar names, in order', () => {
    const trends = [pillar('Health', 'stable'), pillar('Money', 'declining'), pillar('Sleep', 'declining')];
    expect(decliningPillars(trends)).toEqual(['Money', 'Sleep']);
  });

  it('is empty when nothing declines', () => {
    expect(decliningPillars([pillar('Health', 'improving'), pillar('Money', 'stable')])).toEqual([]);
  });
});

describe('pillarHighlight', () => {
  it('names a single sliding pillar', () => {
    const trends = [pillar('Health', 'stable'), pillar('Money', 'declining'), pillar('Creativity', 'stable')];
    expect(pillarHighlight(trends)).toBe('Money has been sliding lately.');
  });

  it('joins multiple sliding pillars', () => {
    const trends = [pillar('Health', 'declining'), pillar('Money', 'declining'), pillar('Creativity', 'stable')];
    expect(pillarHighlight(trends)).toBe('Health and Money have been sliding lately.');
  });

  it('celebrates a climbing pillar when nothing slides', () => {
    const trends = [pillar('Health', 'improving'), pillar('Money', 'stable'), pillar('Creativity', 'stable')];
    expect(pillarHighlight(trends)).toBe('Health is on the way up.');
  });

  it('does not call a pillar climbing when its latest score fell below its own average', () => {
    // Rose early (improving window slope) but just dropped to 2 — the chart reads as a dip.
    const dipped = pillarWith('Money', 'improving', [2, 2, 3, 3, 4, 4, 4, 4, 2]);
    const trends = [pillarWith('Health', 'improving', [3, 3, 4, 4, 5, 5, 5, 5, 5]), dipped, pillar('Creativity', 'stable')];
    expect(pillarHighlight(trends)).toBe('Health is on the way up.');
  });

  it('stays quiet rather than claiming steadiness when a non-stable pillar was excluded', () => {
    const dipped = pillarWith('Money', 'improving', [2, 2, 3, 3, 4, 4, 4, 4, 2]);
    const trends = [pillar('Health', 'stable'), dipped, pillar('Creativity', 'stable')];
    expect(pillarHighlight(trends)).toBeNull();
  });

  it('picks the steadiest pillar when all are stable and one clearly leads', () => {
    const trends = [pillar('Health', 'stable', 3), pillar('Money', 'stable', 2), pillar('Creativity', 'stable', 4)];
    expect(pillarHighlight(trends)).toBe('Creativity has been your steadiest.');
  });

  it('calls it even when all stable pillars sit close together', () => {
    const trends = [pillar('Health', 'stable', 3), pillar('Money', 'stable', 3.2), pillar('Creativity', 'stable', 3.1)];
    expect(pillarHighlight(trends)).toBe('All three holding steady.');
  });

  it('stays quiet while pillars are still warming up', () => {
    expect(pillarHighlight([pillar('Health', 'insufficient'), pillar('Money', 'insufficient'), pillar('Creativity', 'insufficient')])).toBeNull();
    expect(pillarHighlight([pillar('Health', 'stable'), pillar('Money', 'insufficient'), pillar('Creativity', 'stable')])).toBeNull();
  });
});
