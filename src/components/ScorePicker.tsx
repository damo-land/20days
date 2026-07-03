import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { SCALE, SCALE_WORDS } from '@/config';
import { haptics } from '@/lib/haptics';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { useTones } from '@/theme/ThemeProvider';

/** A dot pops in with a spring when it turns on; `delay` staggers a left-to-right wave (Pop). */
function Dot({ on, delay, fill, faint, reduce }: { on: boolean; delay: number; fill: string; faint: string; reduce: boolean }) {
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(on);

  useEffect(() => {
    if (!prev.current && on && !reduce) {
      scale.setValue(0.4);
      Animated.spring(scale, { toValue: 1, delay, useNativeDriver: true, friction: 4.5, tension: 180 }).start();
    }
    prev.current = on;
  }, [on, delay, reduce, scale]);

  return (
    <Animated.View
      style={[
        styles.dot,
        on ? { backgroundColor: fill } : { borderWidth: 1.5, borderColor: faint },
        { transform: [{ scale }] },
      ]}
    />
  );
}

/**
 * The score picker as five circles (docs/DESIGN.md §4: circle = a day, a moment) — tap the
 * nth dot to fill 1…n in ink, with a sprung left-to-right wave and a haptic tick. Wordless:
 * the selection's word lives beside the pillar name (the parent renders it), not under the
 * dots — end anchors were noise three times over.
 */
export function ScorePicker({ value, onChange }: { value: number | null; onChange: (v: number) => void }) {
  const t = useTones();
  const reduce = useReduceMotion();

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
              accessibilityLabel={`${SCALE_WORDS[s - 1]}, score ${s} of ${SCALE.max}`}
              accessibilityState={{ selected: value === s }}
            >
              <Dot on={on} delay={delay} fill={t.ink} faint={t.faint} reduce={reduce} />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  tap: { paddingVertical: 8, paddingHorizontal: 10 },
  dot: { width: 30, height: 30, borderRadius: 15 },
});
