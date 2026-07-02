import { describe, expect, it } from 'vitest';
import { buildSummary, templatedNarrator } from './templatedNarrator';
import { buildApplePrompt, composeBoundedQuestions, isReflective, resolveQuotedNotes } from './applePrompt';
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

describe('isReflective (advice guardrail)', () => {
  it('rejects the real advice-drift question that failed on device', () => {
    // The exact Q3 the on-device model emitted — prescriptive, must be filtered.
    expect(
      isReflective('How have you been managing stress, and what strategies might you consider implementing to improve your sleep?'),
    ).toBe(false);
  });

  it('rejects prescriptive / feelings questions', () => {
    expect(isReflective('What could you try to sleep better?')).toBe(false);
    expect(isReflective('How might you improve your energy?')).toBe(false);
    expect(isReflective('Why do you feel so low lately?')).toBe(false);
    expect(isReflective('Have you considered a new routine?')).toBe(false);
  });

  it('keeps context/cause questions', () => {
    expect(isReflective('What was different about the weeks your sleep dipped?')).toBe(true);
    expect(isReflective('What changes in your work schedule might have contributed to the lack of sleep?')).toBe(true);
    expect(isReflective('What was going on at home during the lower days?')).toBe(true);
  });
});

describe('composeBoundedQuestions (bounded hybrid)', () => {
  const sliding = input.sliding;

  it('places one filtered model question first, then keeps the signal-vs-noise backbone', () => {
    const q = composeBoundedQuestions(['What was going on at work while this slid?'], sliding);
    expect(q.length).toBeLessThanOrEqual(3);
    expect(q[0].source).toBe('apple');
    expect(q[0].text).toContain('work');
    // the templated signal-vs-noise question always survives as the closer
    expect(q[q.length - 1].text.toLowerCase()).toContain('rough patch');
    // at most ONE model-authored question
    expect(q.filter((x) => x.source === 'apple')).toHaveLength(1);
  });

  it('drops a prescriptive model question and falls back to fully templated', () => {
    const q = composeBoundedQuestions(['What strategies could you try to improve sleep?'], sliding);
    expect(q.every((x) => x.source === 'templated')).toBe(true);
    expect(q[q.length - 1].text.toLowerCase()).toContain('rough patch');
  });

  it('picks the first REFLECTIVE model question when several are offered', () => {
    const q = composeBoundedQuestions(
      ['You should try meditation.', 'What changed at work when this dipped?'],
      sliding,
    );
    expect(q[0].source).toBe('apple');
    expect(q[0].text).toContain('changed at work');
  });
});
