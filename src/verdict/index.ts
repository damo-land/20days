import { appleAvailable, appleNarrator } from './appleNarrator';
import { templatedNarrator } from './templatedNarrator';
import type { VerdictInput, VerdictNarrative } from './types';

export type { DatedNote, ReflectionQuestion, SlidingPillar, VerdictInput, VerdictNarrative } from './types';

/**
 * Produce the checkpoint narrative. Prefers the private on-device model when the device can run
 * it; otherwise (and on any failure) uses the deterministic templated narrator. Nothing ever
 * leaves the device on either path. The UI awaits this and renders the result the same either way.
 *
 * NOTE: importing `appleNarrator` pulls the native `@react-native-ai/apple` SDK, which crashes
 * Expo Go / the plain Simulator on load (getEnforcing, no native module). This app therefore runs
 * only in dev builds now — Expo Go is retired. See CLAUDE.md.
 */
export async function generateNarrative(input: VerdictInput): Promise<VerdictNarrative> {
  try {
    if (await appleAvailable()) return await appleNarrator.generate(input);
  } catch {
    // on-device model errored → fall through to the always-available templated floor
  }
  return templatedNarrator.generate(input);
}
