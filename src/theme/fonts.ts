import {
  BricolageGrotesque_300Light,
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import { Roboto_300Light, Roboto_400Regular, Roboto_500Medium } from '@expo-google-fonts/roboto';
import { configureFonts, MD3LightTheme } from 'react-native-paper';

/** Pass to expo-font `useFonts(...)`. Brand §05 weights + heavy Bricolage for M3-Expressive big numbers. */
export const fontsToLoad = {
  BricolageGrotesque_300Light,
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
  Roboto_300Light,
  Roboto_400Regular,
  Roboto_500Medium,
};

/** Heavy display faces for the big expressive numbers (scores, composite, timers). */
export const DISPLAY_FONT = 'BricolageGrotesque_700Bold';
export const DISPLAY_FONT_HEAVY = 'BricolageGrotesque_800ExtraBold';

// Bricolage → logo, headings, display, numbers. Roboto → interface, body, labels.
const DISPLAY = 'BricolageGrotesque_500Medium'; // display + headings track slightly tight
const TITLE = 'BricolageGrotesque_500Medium';
const LABEL = 'Roboto_500Medium';
const BODY = 'Roboto_300Light'; // Light carries longer reading (§05)

const base = MD3LightTheme.fonts;

function familyFor(variant: string): string {
  if (variant.startsWith('display') || variant.startsWith('headline') || variant.startsWith('title')) {
    return variant.startsWith('title') ? TITLE : DISPLAY;
  }
  if (variant.startsWith('label')) return LABEL;
  return BODY;
}

/** Slight negative tracking on the Bricolage display/heading scale (§05: −1.5% to −3%). */
function trackingFor(variant: string, size: number): number {
  if (variant.startsWith('display')) return size * -0.02;
  if (variant.startsWith('headline')) return size * -0.015;
  if (variant.startsWith('title')) return size * -0.01;
  return base[variant as keyof typeof base].letterSpacing ?? 0;
}

const config = Object.fromEntries(
  Object.entries(base).map(([variant, def]) => {
    const size = 'fontSize' in def ? def.fontSize : 14;
    return [variant, { ...def, fontFamily: familyFor(variant), letterSpacing: trackingFor(variant, size) }];
  }),
) as typeof base;

export const fonts = configureFonts({ config });
