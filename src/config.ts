/** App-wide constants. Scale granularity is a DESIGN DECISION (see docs/SPEC.md §1). */
// v2: moved 0–10 → 1–5. Finer granularity gave more trend resolution but felt clunky and
// invited false precision; a 5-step slider is faster and more inviting. Raw scores + this
// version are stored so a future scale change stays interpretable (docs/RESEARCH.md §1.6).
export const SCALE = { min: 1, max: 5, version: 2 } as const;

/** One word per score, 1–5 (docs/DESIGN.md — human, non-clinical). Shown lowercase beside
 *  the pillar name as the live selection word; the picker itself stays wordless dots. */
export const SCALE_WORDS = ['rough', 'uneven', 'okay', 'good', 'great'] as const;

/** External support platform. We signpost; we do not treat (see docs/SPEC.md §3). */
export const SUPPORT_URL = 'https://www.betterhelp.com';
