import type { TrendState } from '@/trend/engine';
import { BRAND } from './brand';

/**
 * The trend scale (Brand Guidelines §04). Colour is never decoration — it reports the
 * direction a pillar is heading. Steady sits in calm teal; a downward drift warms through
 * sand into ochre-orange. Warm, honest — never an alarming red.
 */
export const TREND_SCALE = {
  rising: '#2FA08F',
  steady: '#7FB48A',
  watch: '#E6C36A',
  drifting: '#F0994C',
  declining: '#E07636',
} as const;

/** App trend state → its colour on the scale. Insufficient data is neutral Sand (no trend yet). */
export function trendColor(state: TrendState): string {
  switch (state) {
    case 'improving':
      return TREND_SCALE.rising;
    case 'stable':
      return TREND_SCALE.steady;
    case 'declining':
      return TREND_SCALE.declining;
    default:
      return BRAND.sand;
  }
}
