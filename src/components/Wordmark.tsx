import { StyleSheet, Text, View } from 'react-native';
import { BLUE, INK_LIGHT } from '@/theme/brand';

/**
 * The 20days wordmark (docs/DESIGN.md §0): lowercase Funnel Display SemiBold + the blue
 * square stop — the series signature for every damo.land app. Renders without the Paper
 * theme so it is safe on the splash (before the provider mounts).
 */
export function Wordmark({ size = 44, color = INK_LIGHT }: { size?: number; color?: string }) {
  const side = Math.round(size * 0.15);
  return (
    <View style={styles.row}>
      <Text style={[styles.mark, { fontSize: size, lineHeight: size * 1.05, letterSpacing: size * -0.02, color }]}>
        20days
      </Text>
      <View style={{ width: side, height: side, marginLeft: Math.round(size * 0.08), marginBottom: Math.round(size * 0.08), backgroundColor: BLUE }} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-end' },
  mark: { fontFamily: 'FunnelDisplay_600SemiBold' },
});
