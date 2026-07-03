import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import { hexMix, tones } from './brand';
import { fonts } from './fonts';

/**
 * Full Stop theme (docs/DESIGN.md v2): Ink on Paper, swapped wholesale for dark mode.
 * primary = ink (solid pills, filled controls), background/surface = paper. Chrome is never
 * coloured — Prime Blue and the state hues are applied by components from the tokens, not
 * through Paper colour roles. No trend-driven seed: the trend lives in words and dots now.
 */
export function buildTheme(dark: boolean): MD3Theme {
  const t = tones(dark);
  const base = dark ? MD3DarkTheme : MD3LightTheme;

  const colors = {
    ...base.colors,
    primary: t.ink,
    onPrimary: t.paper,
    primaryContainer: hexMix(t.paper, t.ink, 0.08),
    onPrimaryContainer: t.ink,
    secondary: t.faded,
    onSecondary: t.paper,
    secondaryContainer: hexMix(t.paper, t.ink, 0.06),
    onSecondaryContainer: t.ink,
    tertiary: t.faded,
    onTertiary: t.paper,
    tertiaryContainer: hexMix(t.paper, t.ink, 0.06),
    onTertiaryContainer: t.ink,
    background: t.paper,
    onBackground: t.ink,
    surface: t.paper,
    onSurface: t.ink,
    surfaceVariant: hexMix(t.paper, t.ink, 0.05),
    onSurfaceVariant: t.faded,
    outline: t.faded,
    outlineVariant: t.faint,
    error: '#B3452B',
    onError: t.paper,
    inverseSurface: t.ink,
    inverseOnSurface: t.paper,
    inversePrimary: t.paper,
    elevation: {
      level0: 'transparent',
      level1: t.paper,
      level2: hexMix(t.paper, t.ink, 0.04),
      level3: hexMix(t.paper, t.ink, 0.06),
      level4: hexMix(t.paper, t.ink, 0.08),
      level5: hexMix(t.paper, t.ink, 0.1),
    },
  };

  return { ...base, fonts, colors };
}
