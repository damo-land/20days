import { buildTemplatedQuestions } from './questions';
import type { DatedNote, ReflectionQuestion, SlidingPillar, VerdictInput } from './types';

/**
 * Pure prompt/parse/guardrail helpers for the on-device Apple narrator — deliberately SDK-free so
 * they unit-test in Node (the SDK import in `appleNarrator.ts` pulls react-native, which can't load
 * off-device). Guardrails (docs/RESEARCH.md, FUTURE_IDEAS.md #1): interpreter, NOT author — the
 * model may write ONE reflective question and RANK notes, never rewrite a note or give advice.
 *
 * A 3B model can't be trusted to self-restrain (it drifted into advice in testing), so we defend in
 * depth: (1) a hardened few-shot prompt, and (2) `isReflective` — a deterministic filter that drops
 * any prescriptive question, with the templated backbone always carrying the load.
 */

export const SYSTEM_PROMPT =
  "You help a person reflect on notes they wrote themselves. Do TWO things: (1) write ONE short reflective QUESTION, and (2) pick which of their notes are most revealing. The question MUST be answerable only by them and MUST ask about CONTEXT or CAUSE — what was going on, what changed, what a dip was tied to. NEVER give advice, solutions, tips, strategies or reassurance; never tell them to try, consider, improve, manage, reduce, or do anything; never ask about feelings ('why do you feel...'). Never rephrase or invent a note. Output strictly the requested JSON.\nExamples —\nGOOD: \"What was different about the weeks your sleep dipped?\"\nGOOD: \"What was going on at work while this slid?\"\nBAD (advice): \"What strategies could you try to sleep better?\"\nBAD (advice): \"How might you improve your energy levels?\"\nBAD (feelings): \"Why have you been feeling so low?\"";

/** JSON contract we ask the on-device model to fill. Kept tiny for the ~4k-token context. */
export const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    questions: { type: 'array', items: { type: 'string' }, minItems: 1, maxItems: 2 },
    relevantNoteDates: { type: 'array', items: { type: 'string' } }, // yyyy-mm-dd, must be from the input
  },
  required: ['questions', 'relevantNoteDates'],
} as const;

export interface AppleModelOutput {
  questions: string[];
  relevantNoteDates: string[];
}

/** Build the user-turn prompt from the window — sliding pillars + the user's own note lines. */
export function buildApplePrompt(input: VerdictInput): string {
  const names = input.sliding.map((p) => p.name).join(', ') || '(none clearly)';
  const noteLines = input.notes.length
    ? input.notes.map((n) => `- ${n.date}: ${n.note}`).join('\n')
    : '(the user wrote no notes)';
  return [
    `Pillars trending down: ${names}.`,
    `The user's notes from the period (verbatim, newest first):`,
    noteLines,
    `Write ONE grounded reflective question and list the dates of the most revealing notes.`,
  ].join('\n');
}

/** Map the model's chosen dates back to the user's VERBATIM notes; dedupe, cap at 3. */
export function resolveQuotedNotes(input: VerdictInput, dates: string[]): DatedNote[] {
  const byDate = new Map(input.notes.map((n) => [n.date, n]));
  const picked: DatedNote[] = [];
  for (const d of dates) {
    const n = byDate.get(d);
    if (n && !picked.some((p) => p.date === n.date)) picked.push(n);
    if (picked.length >= 3) break;
  }
  return picked;
}

/**
 * Prescriptive / advice markers — a question containing any of these tells the user what to DO
 * (or asks about feelings), which breaks the interpreter-not-author guardrail. Lowercased
 * substrings; we lean toward over-rejecting (a dropped question just backfills from templated).
 */
const ADVICE_MARKERS = [
  'should', 'you try', 'have you tried', 'consider', 'implement', 'strateg', 'improve', ' tips',
  'ways to', 'how to', 'focus on', 'make sure', 'plan to', 'could you', 'might you', "why don",
  'solution', 'cope', 'manage your', 'managing your', 'avoid', 'reduce', 'increase', 'prioriti',
  ' better?', ' better ', 'what can you do', 'what could you do', 'help you', 'work on',
  'why do you feel', 'why have you been feeling', 'how do you feel',
];

/** True when a question asks about context/cause (reflective), not advice or feelings. */
export function isReflective(text: string): boolean {
  const t = text.toLowerCase();
  return !ADVICE_MARKERS.some((m) => t.includes(m));
}

/**
 * Bounded hybrid: at most ONE model-authored question (personalized, must pass `isReflective`),
 * placed first; the rest is the templated backbone — which always ends with the signal-vs-noise
 * question, so that and the relational/context question survive. Falls back to fully templated when
 * the model gave nothing usable. Pure → unit-tested.
 */
export function composeBoundedQuestions(modelQuestionTexts: string[], sliding: SlidingPillar[]): ReflectionQuestion[] {
  const templated = buildTemplatedQuestions(sliding); // ≥1; last item is always signal-vs-noise
  const modelText = modelQuestionTexts.map((t) => t.trim()).find((t) => t.length > 0 && isReflective(t));
  if (!modelText) return templated;

  const context = templated[0]; // relational (multi-pillar) or a per-pillar context question
  const signal = templated[templated.length - 1]; // signal-vs-noise — always kept
  const seen = new Set<string>();
  return [{ id: 'a0', text: modelText, source: 'apple' as const }, context, signal]
    .filter((q) => q.text && !seen.has(q.text) && (seen.add(q.text), true))
    .slice(0, 3);
}
