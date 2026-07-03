import type { TrendState } from '@/trend/engine';

/**
 * The expressiveness dial — the motion side of Full Stop (docs/DESIGN.md §6).
 *
 * One scalar `dial` ∈ [0,1] drives spring energy: 0 = grounded (calm, settled — NEVER cold),
 * 1 = relaxed (light, gently springy). Layout, colour and structure never change — only how
 * the six verbs bounce.
 *
 * Inputs are two timescales of the user's OWN signal (locked with the user):
 *   - acute:  today's composite score (how today feels right now)
 *   - chronic: the 20-day trend state (improving / stable / declining)
 *
 * Guardrail (docs/RESEARCH.md §2.5): the springy OVERSHOOT only grows on the good side of
 * the dial; the low end stays smooth — we never punish a bad day with a jumpier or colder UI.
 */
export function expressiveness(
  trend: TrendState,
  todayComposite: number | null,
  min: number,
  max: number,
): number {
  const chronic = trend === 'improving' ? 1 : trend === 'declining' ? 0 : 0.5;
  const acute = todayComposite == null ? 0.5 : (todayComposite - min) / (max - min || 1);
  const raw = 0.55 * chronic + 0.45 * acute; // chronic weighted a little heavier
  return Math.max(0, Math.min(1, raw));
}

export interface Spring {
  stiffness: number;
  damping: number;
  mass: number;
}

/** Spring from stiffness + damping RATIO (1 = critically damped / no overshoot). */
function spring(stiffness: number, ratio: number, mass = 1): Spring {
  return { stiffness, mass, damping: ratio * 2 * Math.sqrt(stiffness * mass) };
}

/**
 * Motion tokens for the current dial: spatial springs (position/size/rotation — may
 * overshoot) at three speeds, plus effects springs (opacity — never overshoot). Overshoot is
 * asymmetric: it only appears above the mid-point, so grounded days stay calm.
 * `reduceMotion` forces everything critically damped.
 */
export function motionTokens(dial: number, reduceMotion = false) {
  const good = Math.max(0, (dial - 0.3) / 0.7); // playfulness ramps in above the low third
  const ratio = reduceMotion ? 1 : 1 - 0.5 * good; // 1.0 grounded → 0.5 relaxed
  return {
    spatialDefault: spring(300, ratio),
    spatialFast: spring(520, Math.min(1, ratio + 0.08)),
    spatialSlow: spring(190, ratio),
    effects: spring(320, 1), // opacity never overshoots
  };
}

/** Staggered entrance delay per item (ms) — Pop's ~20ms wave, a touch slower when grounded. */
export function staggerDelay(dial: number, index: number): number {
  return Math.round(index * (dial < 0.4 ? 70 : 55));
}
