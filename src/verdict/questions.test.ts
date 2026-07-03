import { describe, expect, it } from 'vitest';
import { buildTemplatedQuestions } from './questions';
import type { SlidingPillar } from './types';

const p = (pillarId: number, name: string): SlidingPillar => ({ pillarId, name });
const SIGNAL = 'Does this feel like a rough patch with a cause likely to pass, or a slower pattern worth acting on?';

describe('buildTemplatedQuestions', () => {
  it('is deterministic — same input, same questions', () => {
    const a = buildTemplatedQuestions([p(1, 'Health')]);
    const b = buildTemplatedQuestions([p(1, 'Health')]);
    expect(a).toEqual(b);
  });

  it('always closes with the signal-vs-noise question and caps at 3', () => {
    const q = buildTemplatedQuestions([p(1, 'Sleep'), p(2, 'Work')]);
    expect(q.length).toBeLessThanOrEqual(3);
    expect(q[q.length - 1].text).toBe(SIGNAL);
  });

  it('leads with a relational question when two pillars slide together', () => {
    const q = buildTemplatedQuestions([p(1, 'Health'), p(2, 'Sleep')]);
    expect(q[0].text).toContain('Health and Sleep');
    expect(q[0].text.toLowerCase()).toContain('affecting');
  });

  it('goes two questions deep on a single sliding pillar (both grounded in it)', () => {
    const q = buildTemplatedQuestions([p(1, 'Sleep')]);
    // two Sleep-bank questions + the signal question
    expect(q.filter((x) => /sleep|bedtime/i.test(x.text)).length).toBeGreaterThanOrEqual(2);
    expect(q[q.length - 1].text).toBe(SIGNAL);
  });

  it('falls back to generic questions for a custom pillar name', () => {
    const q = buildTemplatedQuestions([p(1, 'Surfing')]);
    expect(q.length).toBeGreaterThanOrEqual(2);
    expect(q.every((x) => x.source === 'templated')).toBe(true);
  });

  it('handles no sliding pillars without throwing', () => {
    const q = buildTemplatedQuestions([]);
    expect(q.length).toBeGreaterThanOrEqual(1);
    expect(q[q.length - 1].text).toBe(SIGNAL);
  });

  it('never emits duplicate question text', () => {
    const q = buildTemplatedQuestions([p(1, 'Health'), p(2, 'Health')]);
    const texts = q.map((x) => x.text);
    expect(new Set(texts).size).toBe(texts.length);
  });
});
