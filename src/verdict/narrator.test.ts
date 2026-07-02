import { describe, expect, it } from 'vitest';
import { buildSummary, templatedNarrator } from './templatedNarrator';
import { buildApplePrompt, resolveQuotedNotes } from './applePrompt';
import type { VerdictInput } from './types';

const input: VerdictInput = {
  windowDays: 20,
  sliding: [
    { pillarId: 1, name: 'Health' },
    { pillarId: 2, name: 'Sleep' },
  ],
  notes: [
    { date: '2026-06-12', note: 'Slept badly all week' },
    { date: '2026-06-11', note: 'Skipped the gym' },
  ],
  pillarRows: [
    { pillarId: 1, date: '2026-06-11', score: 2 },
    { pillarId: 2, date: '2026-06-12', score: 1 },
  ],
};

describe('buildSummary', () => {
  it('names what slid, in the user’s own pillar names, and stays non-clinical', () => {
    const s = buildSummary(input);
    expect(s).toContain('Health and Sleep');
    expect(s).toContain('20 days');
    expect(s).toContain("isn't a diagnosis");
  });

  it('omits pillar names when nothing crossed the per-pillar gate', () => {
    const s = buildSummary({ ...input, sliding: [] });
    expect(s).not.toContain('most of all'); // the names clause is dropped
    expect(s).toContain('20 days');
  });
});

describe('templatedNarrator', () => {
  it('produces a complete, provider-tagged narrative', async () => {
    const n = await templatedNarrator.generate(input);
    expect(n.provider).toBe('templated');
    expect(n.summary.length).toBeGreaterThan(0);
    expect(n.questions.length).toBeGreaterThanOrEqual(2);
    expect(n.quotedNotes.length).toBeGreaterThan(0);
  });
});

describe('appleNarrator pure helpers', () => {
  it('buildApplePrompt includes the sliding pillars and the verbatim notes', () => {
    const prompt = buildApplePrompt(input);
    expect(prompt).toContain('Health, Sleep');
    expect(prompt).toContain('Slept badly all week');
  });

  it('resolveQuotedNotes maps model-chosen dates back to verbatim notes, deduped', () => {
    const out = resolveQuotedNotes(input, ['2026-06-11', '2026-06-11', 'nope']);
    expect(out).toHaveLength(1);
    expect(out[0].note).toBe('Skipped the gym'); // user's exact words, never rephrased
  });
});
