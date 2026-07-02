// TEMP (Expo Go / simulator demo): Apple import disabled so @/verdict doesn't pull the native SDK
// (which crashes Expo Go via getEnforcing). RESTORE the two commented lines below for device builds.
// import { appleAvailable, appleNarrator } from './appleNarrator';
import { templatedNarrator } from './templatedNarrator';
import type { VerdictInput, VerdictNarrative } from './types';

export type { DatedNote, ReflectionQuestion, SlidingPillar, VerdictInput, VerdictNarrative } from './types';

/**
 * Produce the checkpoint narrative. Prefers the private on-device model when the device can run
 * it; otherwise (and on any failure) uses the deterministic templated narrator. Nothing ever
 * leaves the device on either path. The UI awaits this and renders the result the same either way.
 */
export async function generateNarrative(input: VerdictInput): Promise<VerdictNarrative> {
  // try { if (await appleAvailable()) return await appleNarrator.generate(input); } catch {}
  return templatedNarrator.generate(input);
}
