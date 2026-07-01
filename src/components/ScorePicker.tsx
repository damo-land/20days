import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { Text, useTheme } from 'react-native-paper';
import { SCALE, SCALE_LABELS } from '@/config';
import { haptics } from '@/lib/haptics';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { hexMix } from '@/theme/brand';

/** A segment pops in with a spring when it turns on; `delay` staggers a left-to-right wave. */
function Bar({ on, delay, color, empty, reduce }: { on: boolean; delay: number; color: string; empty: string; reduce: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(on);

  useEffect(() => {
    if (!prev.current && on && !reduce) {
      scale.setValue(0.55);
      Animated.spring(scale, { toValue: 1, delay, useNativeDriver: true, friction: 4.5, tension: 160 }).start();
    }
    prev.current = on;
  }, [on, delay, reduce, scale]);

  return <Animated.View style={[styles.bar, { backgroundColor: on ? color : empty, transform: [{ scale }] }]} />;
}

/**
 * Segmented 1–5 score fill (Brand Guidelines §06). Tap a segment to score; filled bars carry
 * the pillar's trend colour, empties are a faint ink. Fast, quiet, one tap — the whole ritual.
 * Newly-filled bars ripple in from the previous value with a haptic tick; word anchors at both
 * ends so the scale never leans on colour alone.
 */
export function ScorePicker({
  value,
  onChange,
  color,
}: {
  value: number | null;
  onChange: (v: number) => void;
  color?: string;
}) {
  const theme = useTheme();
  const reduce = useReduceMotion();
  const fill = color ?? theme.colors.primary;
  const empty = hexMix(theme.colors.surface, theme.colors.onSurface, 0.12);

  // Previous value → the wave starts where the fill already was, not always at 1.
  const prevValue = useRef(value);
  useEffect(() => {
    prevValue.current = value;
  }, [value]);

  const steps: number[] = [];
  for (let n = SCALE.min; n <= SCALE.max; n++) steps.push(n);

  return (
    <View>
      <View style={styles.row}>
        {steps.map((s) => {
          const on = value != null && s <= value;
          const delay = Math.max(0, s - (prevValue.current ?? SCALE.min)) * 24;
          return (
            <Pressable
              key={s}
              onPress={() => {
                haptics.tick();
                onChange(s);
              }}
              style={styles.tap}
              accessibilityRole="button"
              accessibilityLabel={`Score ${s} of ${SCALE.max}`}
              accessibilityState={{ selected: value === s }}
            >
              <Bar on={on} delay={delay} color={fill} empty={empty} reduce={reduce} />
            </Pressable>
          );
        })}
      </View>
      <View style={styles.ends}>
        <Text variant="labelSmall" style={[styles.endLabel, { color: theme.colors.onSurfaceVariant }]}>
          {SCALE_LABELS.low}
        </Text>
        <Text variant="labelSmall" style={[styles.endLabel, { color: theme.colors.onSurfaceVariant }]}>
          {SCALE_LABELS.high}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 7, marginTop: 12 },
  tap: { flex: 1, paddingVertical: 7 },
  bar: { height: 15, borderRadius: 8 },
  ends: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 2 },
  endLabel: { textTransform: 'uppercase', letterSpacing: 0.8, opacity: 0.75 },
});
