import type { DatedNote, ReflectionQuestion, VerdictInput } from './types';

/**
 * Pure prompt/parse helpers for the on-device Apple narrator — deliberately SDK-free so they can be
 * unit-tested in Node (the SDK import in `appleNarrator.ts` pulls in react-native, which can't load
 * outside a device). Guardrails (docs/RESEARCH.md, FUTURE_IDEAS.md #1): interpreter, NOT author —
 * the model may write reflective QUESTIONS and RANK notes, never rewrite a note or give advice.
 */

export const SYSTEM_PROMPT =
  "You are a reflective journaling aid inside a private wellbeing app. The user's own scores for three life pillars have trended down over ~20 days. Your ONLY jobs: (1) write 2-3 short reflective QUESTIONS that help the user think about what has been going on, grounded in their own notes; (2) pick which of their notes are most revealing. Absolute rules: never give advice, solutions, reassurance, or a diagnosis; never rephrase or invent a note; ask about context and cause ('what changed?'), never about feelings ('why do you feel bad?'). Questions must be answerable only by the user. Output strictly the requested JSON.";

/** JSON contract we ask the on-device model to fill. Kept tiny for the ~4k-token context. */
export const OUTPUT_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    questions: { type: 'array', items: { type: 'string' }, minItems: 2, maxItems: 3 },
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
    `Write 2-3 grounded reflective questions and list the dates of the most revealing notes.`,
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

/** Trim, dedupe, cap, and tag the model's question strings. */
export function toQuestions(texts: string[]): ReflectionQuestion[] {
  const seen = new Set<string>();
  return texts
    .map((t) => t.trim())
    .filter((t) => t && (seen.has(t) ? false : (seen.add(t), true)))
    .slice(0, 3)
    .map((text, i) => ({ id: `a${i}`, text, source: 'apple' as const }));
}
