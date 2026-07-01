import { Image } from 'expo-image';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Scallop } from './Scallop';

/**
 * Brand illustration slot — placeholder.
 *
 * Deliberately sparing (see brand critique): illustrations are only used in calm, low-data or
 * warmth moments — empty states and the support tail — NEVER on the daily check-in, the trend
 * chart, or the checkpoint header, and never the celebratory/trophy/burst variants.
 *
 * Drop brand-styled assets into `assets/illustrations/<name>.(svg|png)` and register them in the
 * `SOURCES` map below. Until an asset exists, a quiet scallop motif renders so layouts don't break.
 */
export type IllustrationName = 'growth' | 'reflect' | 'support';

// TODO(user): add styled assets and map them here, e.g.
//   growth: require('../../assets/illustrations/growth.png'),
const SOURCES: Partial<Record<IllustrationName, number>> = {};

export function Illustration({ name, size = 132 }: { name: IllustrationName; size?: number }) {
  const theme = useTheme();
  const src = SOURCES[name];

  if (src == null) {
    // Quiet placeholder until the real asset is added.
    return (
      <View style={{ opacity: 0.22, alignItems: 'center', justifyContent: 'center' }} accessibilityElementsHidden>
        <Scallop size={size} color={theme.colors.outline} bumps={10} />
      </View>
    );
  }
  return <Image source={src} style={{ width: size, height: size }} contentFit="contain" accessibilityIgnoresInvertColors />;
}
