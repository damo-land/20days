/**
 * 20days brand tokens — from the designer's Brand Guidelines v1 (July 2026).
 * Warm, calm base (Cream / Ink) + a trend scale that carries the meaning.
 * Trend colours live in `trendColor.ts`; this is the fixed palette + shape scale.
 */
export const BRAND = {
  cream: '#FDF6E9', // surface — a touch brighter than the original #FBF0E0, still warm (not white)
  card: '#FFF7EC', // raised / card
  containerLow: '#F3E7D2', // surface container — slightly deeper so cards read crisper on cream
  containerHigh: '#EBDDC4', // surface container high — more separation for higher-contrast round
  ink: '#1E2540', // text & primary — deepened from #2A3350 for stronger contrast on cream
  slate: '#4E4C49', // body copy — deepened from #5C5A57 for more readable contrast
  sand: '#A79470', // muted label
  sandDeep: '#8E8168', // muted-2
  primaryContainer: '#DEE4F1', // periwinkle (neutral accent, not a trend colour)
  outlineLight: '#E0D5C0',
  overlay: '#FFFFFF', // sheets / modals sit on white to separate them from the cream base
} as const;

/** Material 3 Expressive corner scale (px) from the guidelines §08. */
export const RADIUS = { xs: 4, s: 8, m: 12, l: 16, xl: 28, full: 999 } as const;

/** Mix two hex colours; t=0 → a, t=1 → b. Small pure helper (no color dep needed). */
export function hexMix(a: string, b: string, t: number): string {
  const pa = parseHex(a);
  const pb = parseHex(b);
  const ch = (i: number) => Math.round(pa[i] + (pb[i] - pa[i]) * t);
  return `#${[ch(0), ch(1), ch(2)].map((n) => n.toString(16).padStart(2, '0')).join('')}`;
}

function parseHex(h: string): [number, number, number] {
  const s = h.replace('#', '');
  return [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
}

/**
 * Readable text colour for a filled accent: Ink on light fills (ochre/sand end of the trend
 * scale), white on dark ones. White fails WCAG on the yellows — never hardcode it on a fill.
 */
export function onColorFor(hex: string): string {
  const [r, g, b] = parseHex(hex).map((n) => {
    const c = n / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luminance > 0.3 ? BRAND.ink : '#FFFFFF';
}

/**
 * Vivify a colour (colour-space extension for the expressiveness dial): nudge saturation and
 * lightness in HSL. Used to let the accent glow a little more on good days, and settle back on
 * grounded ones. `sat`/`light` are signed deltas in [-1,1].
 */
export function vivify(hex: string, sat: number, light: number): string {
  const [r, g, b] = parseHex(hex).map((n) => n / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  let s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  s = Math.max(0, Math.min(1, s + sat));
  const l2 = Math.max(0, Math.min(1, l + light));
  const c = (1 - Math.abs(2 * l2 - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l2 - c / 2;
  const [r1, g1, b1] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  const to = (v: number) =>
    Math.round((v + m) * 255)
      .toString(16)
      .padStart(2, '0');
  return `#${to(r1)}${to(g1)}${to(b1)}`;
}
