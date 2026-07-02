/**
 * The Verdict-Day narrator contract. One seam, swappable backends: a deterministic templated
 * narrator (the always-available, offline, on-device floor) and — when the device supports it —
 * Apple's on-device Foundation Models (private, never leaves the phone). The UI consumes only
 * this shape and never knows which backend produced it. See docs/SPEC.md §3 and FUTURE_IDEAS.md.
 *
 * Guardrails baked into the contract (docs/RESEARCH.md §2.5, §3): questions are grounded in the
 * user's own logged data and are *reflective, never prescriptive* (no advice, no diagnosis);
 * quoted notes are the user's VERBATIM words (extractive, never rephrased — rephrasing corrupts
 * authentic recall, the app's whole anti-recall-bias thesis).
 */

export interface DatedNote {
  date: string; // yyyy-mm-dd
  note: string;
}

export interface ReflectionQuestion {
  id: string;
  text: string;
  source: 'templated' | 'apple';
}

/** A sliding pillar, minimal — id for note relevance, name for the copy. */
export interface SlidingPillar {
  pillarId: number;
  name: string;
}

export interface VerdictInput {
  windowDays: number;
  sliding: SlidingPillar[]; // pillars whose own trend is declining (may be empty)
  notes: DatedNote[]; // all window notes, deduped by day (newest first)
  pillarRows: { pillarId: number; date: string; score: number }[]; // for note relevance ranking
}

export interface VerdictNarrative {
  summary: string; // the calm, non-clinical reading of the window
  questions: ReflectionQuestion[]; // reflective prompts grounded in the data
  quotedNotes: DatedNote[]; // the user's own words, selected by relevance
  provider: 'templated' | 'apple'; // which backend ran (surfaced for debugging/trust, not decoration)
}

export interface VerdictNarrator {
  generate(input: VerdictInput): Promise<VerdictNarrative>;
}
