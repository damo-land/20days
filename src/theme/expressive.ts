import { vivify } from './brand';
import type { TrendState } from '@/trend/engine';

/**
 * The expressiveness dial (Material 3 Expressive, brand-restrained).
 *
 * One scalar `dial` ∈ [0,1] drives motion energy, shape softness, and copy warmth:
 *   0 = grounded (calm, still, warm — NEVER cold), 1 = relaxed (light, gently springy).
 *
 * Inputs are two timescales of the user's OWN signal (locked with the user):
 *   - acute:  today's composite score (how today feels right now)
 *   - chronic: the 20-day trend state (improving / stable / declining)
 *
 * Brand guardrails (docs/RESEARCH.md §2.5, DESIGN.md):
 *   - The "serious" pole stays warm and grounded — we never punish a bad day with a colder UI.
 *   - So the springy OVERSHOOT only grows on the good side of the dial; the low end is still
 *     smooth and warm, just settled. Layout/structure never change — only tone moves.
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

/** M3 spring from stiffness + damping RATIO (1 = critically damped / no overshoot). */
function spring(stiffness: number, ratio: number, mass = 1): Spring {
  return { stiffness, mass, damping: ratio * 2 * Math.sqrt(stiffness * mass) };
}

/**
 * M3-style motion tokens for the current dial. Mirrors M3's structure: spatial springs
 * (position/size/rotation/corners — may overshoot) at three speeds, plus effects springs
 * (opacity/colour — never overshoot). Overshoot is asymmetric: it only appears above the
 * mid-point, so grounded days stay calm. `reduceMotion` forces everything critically damped.
 */
export function motionTokens(dial: number, reduceMotion = false) {
  const good = Math.max(0, (dial - 0.3) / 0.7); // playfulness ramps in above the low third
  const ratio = reduceMotion ? 1 : 1 - 0.5 * good; // 1.0 grounded → 0.5 relaxed (clear, playful bounce)
  return {
    spatialDefault: spring(300, ratio),
    spatialFast: spring(520, Math.min(1, ratio + 0.08)),
    spatialSlow: spring(190, ratio),
    effects: spring(320, 1), // colour/opacity never overshoot
  };
}

/** Card corner radius grows softly with the dial (warm and rounded even when grounded). */
export function dialRadius(dial: number, base = 16, top = 26): number {
  return Math.round(base + (top - base) * dial);
}

/**
 * Accent energy (colour-space extension): the trend accent glows a little more saturated/bright
 * on good days, and settles on grounded ones. Subtle — the base palette is unchanged.
 */
export function accentEnergy(dial: number, hex: string): string {
  const good = Math.max(0, (dial - 0.4) / 0.6);
  return vivify(hex, 0.14 * good, 0.04 * good);
}

/**
 * Check-in subtitle — warmed by the dial (steadier when grounded, brighter when good) and
 * aware of the time of day (`hour` 0–23, injected so this stays pure/testable).
 */
export function todayGreeting(dial: number, hour: number): string {
  const morning = hour < 12;
  const evening = hour >= 17;
  if (dial >= 0.62) {
    if (morning) return 'Good run lately — set the tone early.';
    if (evening) return 'Good run lately — how did today land?';
    return 'Good run lately — how did each pillar feel today?';
  }
  if (dial <= 0.32) {
    if (morning) return 'A gentle start. How does today feel so far?';
    if (evening) return "Let's close today gently. How did each one feel?";
    return "Let's take today gently. How did each one feel?";
  }
  if (morning) return 'Early check-in — one tap each, under a minute.';
  if (evening) return 'How did today land? One tap each — under a minute.';
  return 'How did each pillar feel? One tap each — under a minute.';
}

/** Staggered entrance delay per item (ms). Slightly livelier when relaxed. */
export function staggerDelay(dial: number, index: number): number {
  return Math.round(index * (reduce(dial) ? 70 : 55));
}
function reduce(dial: number): boolean {
  return dial < 0.4;
}
