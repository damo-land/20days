import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { trendColor } from '@/theme/trendColor';
import type { TrendState } from '@/trend/engine';

const LABEL: Record<TrendState, string> = {
  improving: 'Rising',
  stable: 'Steady',
  declining: 'Drifting',
  insufficient: 'Not enough data yet',
};

/**
 * Trend tag — a coloured dot + word in the trend colour (Brand Guidelines §06). Never colour
 * alone: the word carries the meaning too (a11y + anti-alarm, docs/DESIGN.md §2).
 */
export function TrendChip({ state }: { state: TrendState }) {
  const c = trendColor(state);
  return (
    <View style={styles.row}>
      <View style={[styles.dot, { backgroundColor: c }]} />
      <Text variant="labelMedium" style={{ color: c }}>
        {LABEL[state]}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 7, height: 7, borderRadius: 4 },
});
