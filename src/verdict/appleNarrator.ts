import { apple } from '@react-native-ai/apple';
import { generateObject, jsonSchema } from 'ai';
import { buildSummary, templatedNarrator } from './templatedNarrator';
import { buildTemplatedQuestions } from './questions';
import {
  buildApplePrompt,
  OUTPUT_SCHEMA,
  resolveQuotedNotes,
  SYSTEM_PROMPT,
  toQuestions,
  type AppleModelOutput,
} from './applePrompt';
import type { VerdictInput, VerdictNarrative, VerdictNarrator } from './types';

/**
 * PHASE 2 — on-device Apple Foundation Models narrator (private, sealed, no cloud). Everything the
 * model sees stays on the device.
 *
 * ⚠️ Runs ONLY in a dev build on a capable device. `@react-native-ai/apple` imports `NativeAppleLLM`
 * via `TurboModuleRegistry.getEnforcing`, which THROWS at load in Expo Go and the iOS Simulator (no
 * native module) — so this file (and anything importing it) must never load there. It reaches the
 * Verdict screen only through the async `generateNarrative` seam, and `appleAvailable()` gates every
 * call: on any non-capable device / Apple-Intelligence-off / error it returns false and the
 * templated narrator runs instead. Requires: dev build, iOS 26+, A17 Pro / M1+, Apple Intelligence
 * ON. Model output quality is verified on-device (can't be exercised in the sim or unit tests).
 * Pure prompt/parse/guardrail logic lives in `applePrompt.ts` (SDK-free, unit-tested).
 */

/** Is the on-device model usable right now? `apple.isAvailable()` is synchronous; guard it so a
 *  missing native module / disabled Apple Intelligence / any throw all resolve to false → templated. */
export async function appleAvailable(): Promise<boolean> {
  try {
    return apple.isAvailable();
  } catch {
    return false;
  }
}

/**
 * Run one on-device structured generation via the Vercel AI SDK against the Apple provider.
 * Throws on any problem so the caller falls back to templated. `apple()` is an AI-SDK language
 * model; `generateObject` + a JSON schema coerce the ~3B model into our tiny output contract.
 */
async function runAppleStructured(prompt: string): Promise<AppleModelOutput> {
  const { object } = await generateObject({
    model: apple(),
    schema: jsonSchema<AppleModelOutput>(OUTPUT_SCHEMA as Record<string, unknown>),
    system: SYSTEM_PROMPT,
    prompt,
  });
  return object;
}

export const appleNarrator: VerdictNarrator = {
  async generate(input: VerdictInput): Promise<VerdictNarrative> {
    const out = await runAppleStructured(buildApplePrompt(input));
    // Belt-and-braces: if the model returned too few usable questions, top up from templated so
    // the checkpoint is never thin. Notes are always the user's verbatim text (extractive).
    const questions = toQuestions(out.questions);
    const filled =
      questions.length >= 2 ? questions : [...questions, ...buildTemplatedQuestions(input.sliding)].slice(0, 3);
    const quoted = resolveQuotedNotes(input, out.relevantNoteDates);
    return {
      summary: buildSummary(input), // summary stays deterministic — no need to spend model context on it
      questions: filled,
      quotedNotes: quoted.length ? quoted : (await templatedNarrator.generate(input)).quotedNotes,
      provider: 'apple',
    };
  },
};
