import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import type { TrendState } from '@/trend/engine';
import { BRAND, hexMix } from './brand';
import { fonts } from './fonts';
import { trendColor } from './trendColor';

/**
 * Build the 20days Material 3 theme (Brand Guidelines §07). The neutral surface + primary
 * roles are fixed Cream/Ink; the ACCENT is dynamic — it follows the current trend along the
 * scale, and surfaces warm very subtly with it. Expressive, but never to alarm-red. Nav and
 * general chrome stay neutral (trend colour reports trends only, never decorates the UI).
 */
export function buildTheme(state: TrendState, dark: boolean): MD3Theme {
  const accent = trendColor(state);
  const tint = state === 'insufficient' ? 0 : 0.05; // how much the surface warms with the trend
  const base = dark ? MD3DarkTheme : MD3LightTheme;

  const colors = dark
    ? {
        ...base.colors,
        primary: BRAND.cream,
        onPrimary: BRAND.ink,
        primaryContainer: hexMix(BRAND.ink, '#FFFFFF', 0.16),
        onPrimaryContainer: BRAND.cream,
        secondary: accent,
        onSecondary: BRAND.ink,
        secondaryContainer: hexMix(BRAND.ink, accent, 0.32),
        onSecondaryContainer: BRAND.cream,
        tertiary: BRAND.sand,
        onTertiary: BRAND.ink,
        tertiaryContainer: hexMix(BRAND.ink, BRAND.sand, 0.3),
        onTertiaryContainer: BRAND.cream,
        background: hexMix(BRAND.ink, accent, tint),
        onBackground: BRAND.cream,
        surface: hexMix(BRAND.ink, accent, tint),
        onSurface: BRAND.cream,
        surfaceVariant: hexMix(BRAND.ink, '#FFFFFF', 0.1),
        onSurfaceVariant: '#C9C3B5',
        outline: '#565E77',
        outlineVariant: hexMix(BRAND.ink, '#FFFFFF', 0.14),
        error: '#E0925E',
        onError: BRAND.ink,
        inverseSurface: BRAND.cream,
        inverseOnSurface: BRAND.ink,
        inversePrimary: BRAND.ink,
        elevation: {
          level0: 'transparent',
          level1: hexMix(BRAND.ink, '#FFFFFF', 0.05),
          level2: hexMix(BRAND.ink, '#FFFFFF', 0.08),
          level3: hexMix(BRAND.ink, '#FFFFFF', 0.11),
          level4: hexMix(BRAND.ink, '#FFFFFF', 0.13),
          level5: hexMix(BRAND.ink, '#FFFFFF', 0.15),
        },
      }
    : {
        ...base.colors,
        primary: BRAND.ink,
        onPrimary: BRAND.cream,
        primaryContainer: BRAND.primaryContainer,
        onPrimaryContainer: BRAND.ink,
        secondary: accent,
        onSecondary: BRAND.cream,
        secondaryContainer: hexMix(BRAND.cream, accent, 0.22),
        onSecondaryContainer: BRAND.ink,
        tertiary: BRAND.sand,
        onTertiary: BRAND.cream,
        tertiaryContainer: hexMix(BRAND.cream, BRAND.sand, 0.3),
        onTertiaryContainer: BRAND.ink,
        background: hexMix(BRAND.cream, accent, tint),
        onBackground: BRAND.ink,
        surface: hexMix(BRAND.cream, accent, tint),
        onSurface: BRAND.ink,
        surfaceVariant: hexMix(BRAND.containerLow, accent, tint + 0.01),
        onSurfaceVariant: BRAND.slate,
        outline: BRAND.sand,
        outlineVariant: BRAND.outlineLight,
        error: '#B3452B',
        onError: BRAND.cream,
        errorContainer: '#F6DDD3',
        onErrorContainer: '#4A1B0E',
        inverseSurface: BRAND.ink,
        inverseOnSurface: BRAND.cream,
        inversePrimary: BRAND.cream,
        elevation: {
          level0: BRAND.cream,
          level1: BRAND.card,
          level2: BRAND.containerLow,
          level3: BRAND.containerHigh,
          level4: hexMix(BRAND.containerHigh, BRAND.sand, 0.12),
          level5: hexMix(BRAND.containerHigh, BRAND.sand, 0.18),
        },
      };

  return { ...base, fonts, colors };
}
