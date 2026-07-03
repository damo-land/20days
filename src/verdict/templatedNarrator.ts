import { joinNames } from '@/trend/pillars';
import { buildTemplatedQuestions } from './questions';
import { selectRelevantNotes } from './notes';
import type { VerdictInput, VerdictNarrative, VerdictNarrator } from './types';

/**
 * The deterministic narrator — offline, on-device, zero cost, ships in Expo Go. It's the always
 * -available floor behind the Verdict narrator seam and the fallback whenever the on-device model
 * is unavailable. Everything here is pure/synchronous; `generate` returns a Promise only to match
 * the async `VerdictNarrator` contract the model backend needs.
 */

/** A calm, non-clinical one-liner naming what slid, in the user's own pillar names. */
export function buildSummary(input: VerdictInput): string {
  const names = input.sliding.map((p) => p.name);
  const lead = names.length
    ? `Your scores have drifted down over the last ${input.windowDays} days, ${joinNames(names)} most of all.`
    : `Your scores have drifted down over the last ${input.windowDays} days.`;
  return `${lead} This isn't a diagnosis, just what you logged.`;
}

export const templatedNarrator: VerdictNarrator = {
  async generate(input: VerdictInput): Promise<VerdictNarrative> {
    return {
      summary: buildSummary(input),
      questions: buildTemplatedQuestions(input.sliding),
      quotedNotes: selectRelevantNotes(
        input.notes,
        input.pillarRows,
        input.sliding.map((p) => p.pillarId),
      ),
      provider: 'templated',
    };
  },
};
