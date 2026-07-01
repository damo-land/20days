import { describe, expect, it } from 'vitest';
import { buildDailySeries } from './series';
import {
  DEFAULT_TREND_CONFIG,
  detectTrend,
  shouldTriggerVerdict,
  theilSenSlope,
  type DayPoint,
} from './engine';

function series(values: (number | null)[]): DayPoint[] {
  // dates are irrelevant to detectTrend's maths; use sequential placeholders
  return values.map((value, i) => ({ date: `2026-01-${String(i + 1).padStart(2, '0')}`, value }));
}

describe('theilSenSlope', () => {
  it('recovers a clean linear slope', () => {
    const pts = [0, 1, 2, 3, 4].map((x) => ({ x, y: 2 * x + 1 }));
    expect(theilSenSlope(pts)).toBeCloseTo(2, 6);
  });
  it('is robust to a single outlier', () => {
    const pts = [0, 1, 2, 3, 4].map((x) => ({ x, y: x }));
    pts[2].y = 100; // outlier
    expect(theilSenSlope(pts)).toBeCloseTo(1, 6);
  });
});

describe('detectTrend', () => {
  it('flags a clear sustained decline', () => {
    const vals = Array.from({ length: 20 }, (_, i) => 8 - (5 * i) / 19); // 8 → 3
    const r = detectTrend(series(vals));
    expect(r.state).toBe('declining');
    expect(r.projectedChange).toBeLessThan(0);
  });

  it('calls a flat series stable', () => {
    const r = detectTrend(series(Array(20).fill(6)));
    expect(r.state).toBe('stable');
  });

  it('flags a clear rise as improving', () => {
    const vals = Array.from({ length: 20 }, (_, i) => 3 + (5 * i) / 19); // 3 → 8
    expect(detectTrend(series(vals)).state).toBe('improving');
  });

  it('returns insufficient when too few days are logged', () => {
    const vals: (number | null)[] = Array(20).fill(null);
    for (let i = 0; i < 5; i++) vals[i] = 8 - i; // only 5 logged
    const r = detectTrend(series(vals));
    expect(r.state).toBe('insufficient');
    expect(r.loggedDays).toBe(5);
  });

  it('tolerates gaps and still detects decline', () => {
    const vals = Array.from({ length: 20 }, (_, i) => (i % 4 === 0 ? null : 8 - (5 * i) / 19));
    const r = detectTrend(series(vals));
    expect(r.loggedDays).toBeGreaterThanOrEqual(DEFAULT_TREND_CONFIG.minLoggedDays);
    expect(r.state).toBe('declining');
  });

  // Scale is now 1–5 (config.SCALE v2). These assert the re-tuned magnitudeFloor (0.2)
  // behaves on that domain: a real 4→2 slide fires, but 1-step integer jitter does not.
  it('flags a realistic 1–5 decline', () => {
    const vals = Array.from({ length: 20 }, (_, i) => 4 - (2 * i) / 19); // 4 → 2
    expect(detectTrend(series(vals)).state).toBe('declining');
  });

  it('does not false-alarm on flat 1–5 jitter', () => {
    // wobbles 2–4 around a mean of 3 with no underlying drift
    const wobble = [3, 4, 3, 2];
    const vals = Array.from({ length: 20 }, (_, i) => wobble[i % 4]);
    expect(detectTrend(series(vals)).state).toBe('stable');
  });
});

describe('shouldTriggerVerdict', () => {
  const now = Date.parse('2026-02-01T12:00:00Z');
  const declining = detectTrend(series(Array.from({ length: 20 }, (_, i) => 8 - (5 * i) / 19)));

  it('fires when declining and no prior verdict', () => {
    expect(shouldTriggerVerdict(declining, null, now)).toBe(true);
  });
  it('is blocked by an active cooldown', () => {
    const recent = now - 2 * 86_400_000; // 2 days ago, cooldown is 14
    expect(shouldTriggerVerdict(declining, recent, now)).toBe(false);
  });
  it('fires again once the cooldown has elapsed', () => {
    const old = now - 20 * 86_400_000;
    expect(shouldTriggerVerdict(declining, old, now)).toBe(true);
  });
  it('never fires on a stable trend', () => {
    const stable = detectTrend(series(Array(20).fill(6)));
    expect(shouldTriggerVerdict(stable, null, now)).toBe(false);
  });
});

describe('buildDailySeries', () => {
  it('averages multiple pillars per day and marks gaps null', () => {
    const rows = [
      { date: '2026-01-10', score: 4 },
      { date: '2026-01-10', score: 8 }, // same day, avg = 6
      { date: '2026-01-12', score: 5 },
    ];
    const s = buildDailySeries(rows, 3, '2026-01-12');
    expect(s.map((p) => p.value)).toEqual([6, null, 5]);
  });
});
