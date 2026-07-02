import type { TrendState } from '@/trend/engine';
import { BRAND } from './brand';

/**
 * The trend scale (Brand Guidelines §04). Colour is never decoration — it reports the
 * direction a pillar is heading. Steady sits in calm teal; a downward drift warms through
 * sand into ochre-orange. Warm, honest — never an alarming red.
 */
export const TREND_SCALE = {
  rising: '#16A085', // vivid teal — punchier than the old muted #2FA08F
  steady: '#4FB06A', // saturated green (was #7FB48A)
  watch: '#EBBB3F', // brighter gold (was #E6C36A)
  drifting: '#F58A2E', // saturated orange (was #F0994C)
  declining: '#E85D2C', // warm ochre-orange — more saturated, still NOT alarm-red (guardrail, RESEARCH §2.5)
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
