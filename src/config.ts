/** App-wide constants. Scale granularity is a DESIGN DECISION (see docs/SPEC.md §1). */
// v2: moved 0–10 → 1–5. Finer granularity gave more trend resolution but felt clunky and
// invited false precision; a 5-step slider is faster and more inviting. Raw scores + this
// version are stored so a future scale change stays interpretable (docs/RESEARCH.md §1.6).
export const SCALE = { min: 1, max: 5, version: 2 } as const;

/** End labels for the score slider (docs/DESIGN.md §3 — human, non-clinical). */
export const SCALE_LABELS = { low: 'Rough', high: 'Great' } as const;

/** External support platform. We signpost; we do not treat (see docs/SPEC.md §3). */
export const SUPPORT_URL = 'https://www.betterhelp.com';
