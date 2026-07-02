import type { ReflectionQuestion, SlidingPillar } from './types';

/**
 * Templated reflection questions — the deterministic floor that ships everywhere (Expo Go, any
 * device). Grounded in *which* pillar slid; reflective, never prescriptive (docs/RESEARCH.md §3.3).
 * The on-device model can later add sharper, note-aware questions, but these must always stand
 * on their own. Questions ask about CONTEXT and CAUSE ("what changed?"), never affect
 * ("why do you feel bad?") — the latter feeds rumination (§2.5).
 */

/** Per-pillar banks, keyed by the preset pillar names (see theme/pillarMeta.ts). */
const PILLAR_QUESTIONS: Record<string, string[]> = {
  Health: ['What was different about the weeks your Health dipped?', 'Did anything specific pull your Health down, or was it a slow drift?'],
  Fitness: ['What got in the way of moving the way you wanted to?', 'Was the dip in Fitness a one-off stretch, or a pattern forming?'],
  Sleep: ['What was happening around bedtime on the roughest days?', 'Is your Sleep dip tied to something that will pass, or a habit that stuck?'],
  Work: ['What at work weighed on you most during this stretch?', 'Was the Work dip about one project, or something steadier?'],
  Money: ['What money pressure was on your mind these weeks?', 'Is this a short squeeze, or a pattern worth planning around?'],
  Relationships: ['Which relationship was on your mind most as this slid?', 'Was there a specific moment, or a slow distance building?'],
  Family: ['What was going on at home during the lower days?', 'Is the Family dip about a passing situation, or something ongoing?'],
  Friends: ['Did you see less of people than you wanted to lately?', 'Was the Friends dip about time, distance, or something else?'],
  Learning: ['What crowded out the learning you meant to make time for?', 'Was this a busy patch, or has the interest itself cooled?'],
  Creativity: ['What made space for creativity feel hard to find?', 'Is the Creativity dip about energy, time, or pull toward it?'],
  Mindfulness: ['What made it hard to pause and check in with yourself?', 'Was the dip a busy stretch, or a practice slipping away?'],
  Fun: ['When did you last do something purely for the joy of it?', 'Was the Fun dip about time, energy, or something heavier?'],
};

const GENERIC: string[] = [
  'What was going on in your life during these weeks?',
  'Was there a clear cause, or did this creep up quietly?',
];

/** The core signal-vs-illusion question — the app's whole purpose, always asked last. */
const SIGNAL_VS_NOISE =
  'Does this feel like a rough patch with a cause likely to pass — or a slower pattern worth acting on?';

/** Stable, non-random pick so the same window always shows the same questions (no Math.random). */
function pick(name: string, n: number): string[] {
  const bank = PILLAR_QUESTIONS[name] ?? GENERIC;
  const start = charSum(name) % bank.length;
  const out: string[] = [];
  for (let i = 0; i < bank.length && out.length < n; i++) out.push(bank[(start + i) % bank.length]);
  return out;
}

function charSum(s: string): number {
  let n = 0;
  for (let i = 0; i < s.length; i++) n += s.charCodeAt(i);
  return n;
}

/** When two+ pillars slide together, name it — they usually share a cause (user's own intuition). */
function relational(names: string[]): string {
  const [a, b] = names;
  return `${a} and ${b} dipped around the same time — could one be affecting the other?`;
}

/**
 * Build 2–3 grounded reflection questions from the sliding pillars. Multi-pillar leads with the
 * relational prompt (one screen, one shared story); single-pillar goes two questions deep on it.
 * Always closes with the signal-vs-noise question. Deduped, capped at 3.
 */
export function buildTemplatedQuestions(sliding: SlidingPillar[]): ReflectionQuestion[] {
  const texts: string[] = [];
  if (sliding.length >= 2) {
    texts.push(relational(sliding.map((p) => p.name)));
    texts.push(...pick(sliding[0].name, 1));
  } else if (sliding.length === 1) {
    texts.push(...pick(sliding[0].name, 2));
  } else {
    texts.push(...GENERIC);
  }
  texts.push(SIGNAL_VS_NOISE);

  const seen = new Set<string>();
  return texts
    .filter((t) => (seen.has(t) ? false : (seen.add(t), true)))
    .slice(0, 3)
    .map((text, i) => ({ id: `t${i}`, text, source: 'templated' as const }));
}
