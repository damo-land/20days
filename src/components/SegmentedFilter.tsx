import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import { Text } from 'react-native-paper';
import { haptics } from '@/lib/haptics';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { BRAND, onColorFor } from '@/theme/brand';
import { motionTokens } from '@/theme/expressive';

export interface Segment {
  key: string;
  label: string;
}

/**
 * One connected segmented control (M3 Expressive) — a single track holding all filters, with a
 * pill that springs across to the selected segment. Segments are variable-width, so we measure
 * each with onLayout and animate the pill's left/width to match.
 */
export function SegmentedFilter({
  options,
  selectedKey,
  onSelect,
  dial,
  colorFor,
}: {
  options: Segment[];
  selectedKey: string;
  onSelect: (key: string) => void;
  dial: number;
  colorFor: (key: string) => string;
}) {
  const theme = useTheme();
  const reduce = useReduceMotion();
  const [layouts, setLayouts] = useState<Record<string, { x: number; w: number }>>({});
  const left = useRef(new Animated.Value(0)).current;
  const width = useRef(new Animated.Value(0)).current;
  const sel = layouts[selectedKey];

  useEffect(() => {
    if (!sel) return;
    if (reduce) {
      left.setValue(sel.x);
      width.setValue(sel.w);
      return;
    }
    const { spatialDefault } = motionTokens(dial, reduce);
    Animated.parallel([
      Animated.spring(left, { toValue: sel.x, useNativeDriver: false, ...spatialDefault }),
      Animated.spring(width, { toValue: sel.w, useNativeDriver: false, ...spatialDefault }),
    ]).start();
  }, [sel?.x, sel?.w, selectedKey, reduce, dial, left, width]);

  return (
    <View style={[styles.track, { backgroundColor: BRAND.overlay, borderColor: theme.colors.outlineVariant }]}>
      {sel ? <Animated.View style={[styles.pill, { left, width, backgroundColor: colorFor(selectedKey) }]} /> : null}
      {options.map((o) => {
        const active = o.key === selectedKey;
        return (
          <Pressable
            key={o.key}
            onPress={() => {
              if (o.key !== selectedKey) haptics.tick();
              onSelect(o.key);
            }}
            onLayout={(e) => {
              const { x, width: w } = e.nativeEvent.layout;
              setLayouts((prev) => (prev[o.key]?.x === x && prev[o.key]?.w === w ? prev : { ...prev, [o.key]: { x, w } }));
            }}
            style={styles.seg}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
          >
            <Text variant="labelLarge" style={{ fontSize: 14, color: active ? onColorFor(colorFor(o.key)) : theme.colors.onSurface }}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', borderRadius: 24, padding: 4, borderWidth: 1 },
  pill: { position: 'absolute', top: 4, bottom: 4, borderRadius: 20 },
  seg: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, zIndex: 1 },
});
