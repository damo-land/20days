import {
  FunnelDisplay_500Medium,
  FunnelDisplay_600SemiBold,
} from '@expo-google-fonts/funnel-display';
import {
  FunnelSans_400Regular,
  FunnelSans_500Medium,
  FunnelSans_600SemiBold,
} from '@expo-google-fonts/funnel-sans';
import { configureFonts, MD3LightTheme } from 'react-native-paper';
import { TYPE } from './brand';

/** Pass to expo-font `useFonts(...)`. Funnel Display (headlines/numbers) + Funnel Sans (body/labels). */
export const fontsToLoad = {
  FunnelDisplay_500Medium,
  FunnelDisplay_600SemiBold,
  FunnelSans_400Regular,
  FunnelSans_500Medium,
  FunnelSans_600SemiBold,
};

const base = MD3LightTheme.fonts;

/**
 * Map every Paper variant onto the fixed six-token scale (DESIGN.md §3) so `Text variant=`
 * can't drift off-token: display* → display, headline* → headline, title* → title,
 * label* → label (labelSmall → micro), body* → body.
 */
function tokenFor(variant: string) {
  if (variant.startsWith('display')) return TYPE.display;
  if (variant.startsWith('headline')) return TYPE.headline;
  if (variant.startsWith('title')) return TYPE.title;
  if (variant === 'labelSmall') return TYPE.micro;
  if (variant.startsWith('label')) return TYPE.label;
  return TYPE.body;
}

const config = Object.fromEntries(
  Object.entries(base).map(([variant, def]) => {
    const t = tokenFor(variant);
    return [
      variant,
      {
        ...def,
        fontFamily: t.fontFamily,
        fontSize: t.fontSize,
        lineHeight: t.lineHeight,
        letterSpacing: 'letterSpacing' in t ? t.letterSpacing : 0,
      },
    ];
  }),
) as unknown as typeof base;

export const fonts = configureFonts({ config });
