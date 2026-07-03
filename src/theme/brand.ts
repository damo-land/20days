/**
 * "Full Stop" design-language tokens (docs/DESIGN.md v2, July 2026).
 * Two surfaces (Ink on Paper, swapped wholesale for dark mode), one blue, four state hues.
 * Chrome is never coloured; grey is always faded ink. Nothing else exists.
 */

/** Prime Blue — ONE hex in both modes (user-locked; no lifted dark variant). */
export const BLUE = '#2337FF';

/** State hues — exceptional, Verdict-grade only; tinted dots or one glow, never chrome. */
export const STATE = {
  mint: '#46C08A', // improving
  sun: '#EFBF3C', // a dip worth watching
  coral: '#EF6F5A', // checkpoint / declining
  lilac: '#9C8CF2', // the user's own words
} as const;

/** Coral tint ramp for the Verdict's sliding-pillar dots (tone on tone — no ink on colour). */
export const CORAL_DOTS = {
  light: { fill: '#E06450', faint: '#F0C4BA', today: '#B44430' },
  dark: { fill: '#EF8975', faint: '#4E332E', today: '#FFB4A4' },
} as const;

/**
 * Per-pillar state blocks on Trend (user-requested, July 2026): a soft hue wash behind the
 * row, with everything on it tone-on-tone (deep hue text/number, hue dots). Colour only when
 * a pillar is MOVING — steady/settling rows stay a neutral paper wash so the hues keep
 * meaning. Solid mixed hexes (not alpha) so dark mode stays controlled.
 */
export interface StateBlock {
  wash: string;
  deep: string; // text + number + today's dot on the wash
  dot: string; // logged-day dots
  faint: string; // missed-day dots
}

export const STATE_BLOCKS: Record<'improving' | 'declining', { light: StateBlock; dark: StateBlock }> = {
  improving: {
    light: { wash: '#E4F1E9', deep: '#1E6B47', dot: '#46C08A', faint: '#C2DFD0' },
    dark: { wash: '#17221C', deep: '#9FE0BE', dot: '#3FA377', faint: '#2C4437' },
  },
  declining: {
    light: { wash: '#F9E9E4', deep: '#96371F', dot: '#E06450', faint: '#EDC7BC' },
    dark: { wash: '#251613', deep: '#F0A18F', dot: '#C96A56', faint: '#4E332E' },
  },
};

export interface Tones {
  dark: boolean;
  paper: string;
  ink: string;
  faded: string;
  faint: string;
  hair: string;
  blue: string;
}

const LIGHT: Tones = {
  dark: false,
  paper: '#F6F5F1',
  ink: '#131311',
  faded: '#6F6E67',
  faint: '#C9C7C0',
  hair: 'rgba(19,19,17,0.16)',
  blue: BLUE,
};

const DARK: Tones = {
  dark: true,
  paper: '#0F0F0D',
  ink: '#F2F1EC',
  faded: '#8E8D85',
  faint: '#3A3A36',
  hair: 'rgba(242,241,236,0.16)',
  blue: BLUE,
};

export function tones(dark: boolean): Tones {
  return dark ? DARK : LIGHT;
}

/** Splash + pre-theme surfaces (the wordmark always sits Paper-on-Ink). */
export const INK_LIGHT = LIGHT.ink;
export const PAPER_LIGHT = LIGHT.paper;
export const PAPER_DARK = DARK.paper;

/**
 * The fixed type scale — six sizes, nothing in between (DESIGN.md §3). `family` keys map to
 * fonts loaded in `fonts.ts`. Body 16 is the floor; micro is for uppercase eyebrows only.
 */
export const TYPE = {
  display: { fontFamily: 'FunnelDisplay_600SemiBold', fontSize: 36, lineHeight: 40, letterSpacing: -0.54 },
  headline: { fontFamily: 'FunnelDisplay_600SemiBold', fontSize: 28, lineHeight: 32, letterSpacing: -0.28 },
  title: { fontFamily: 'FunnelDisplay_500Medium', fontSize: 20, lineHeight: 26 },
  body: { fontFamily: 'FunnelSans_400Regular', fontSize: 16, lineHeight: 24 },
  label: { fontFamily: 'FunnelSans_500Medium', fontSize: 13, lineHeight: 18 },
  micro: {
    fontFamily: 'FunnelSans_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase' as const,
  },
} as const;

/** Numbers ride Funnel Display, always tabular (DESIGN.md §3). */
export const NUMBER_FONT = 'FunnelDisplay_600SemiBold';

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
