import { Text } from 'react-native';
import { BLUE } from '@/theme/brand';

/**
 * The full stop — a Prime Blue SQUARE that ends every headline statement (docs/DESIGN.md §4:
 * square = punctuation, circle = a day/now; headlines ONLY — never buttons). Rendered as the
 * ■ glyph so it sits on the text baseline like real punctuation (an inline <View> bottom-aligns
 * to the line box and "falls" under descenders — learned the hard way).
 */
export function Stop({ size, color = BLUE }: { size: number; color?: string }) {
  return <Text style={{ color, fontSize: Math.round(size * 0.42) }}> ■</Text>;
}
