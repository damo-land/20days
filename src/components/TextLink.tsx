import { useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { haptics } from '@/lib/haptics';
import { useTones } from '@/theme/ThemeProvider';

/**
 * An editorial action (docs/DESIGN.md §5): underlined lowercase text link. The optional
 * arrow is punctuation, not an icon — blue because it acts, and it springs ~5px forward on
 * press (the gap opens; the in-app sibling of the web hover).
 */
export function TextLink({
  label,
  onPress,
  arrow,
  size = 16,
  color,
  align,
}: {
  label: string;
  onPress: () => void;
  /** '↗' is banned — Funnel has no glyph for it (renders as a tofu box); externals use '→'. */
  arrow?: '→' | '←';
  size?: number;
  color?: string;
  align?: 'center';
}) {
  const t = useTones();
  const reduce = useReduceMotion();
  const x = useRef(new Animated.Value(0)).current;
  const fg = color ?? t.ink;

  const nudge = (to: number) => {
    if (reduce || !arrow) return;
    // ← nudges backward; → and ↗ open the gap forward.
    const dir = arrow === '←' ? -to : to;
    Animated.spring(x, { toValue: dir, useNativeDriver: true, stiffness: 420, damping: 16, mass: 1 }).start();
  };

  return (
    <Pressable
      onPress={() => {
        haptics.tick();
        onPress();
      }}
      onPressIn={() => nudge(5)}
      onPressOut={() => nudge(0)}
      accessibilityRole="link"
      accessibilityLabel={label}
      style={align === 'center' ? styles.center : undefined}
      hitSlop={8}
    >
      <View style={styles.row}>
        {arrow === '←' ? (
          <Animated.Text
            style={[styles.back, { fontSize: size, lineHeight: size * 1.5, color: t.blue, transform: [{ translateX: x }] }]}
          >
            {arrow}
          </Animated.Text>
        ) : null}
        <Text style={[styles.text, { fontSize: size, lineHeight: size * 1.5, color: fg, textDecorationColor: fg }]}>
          {label}
        </Text>
        {arrow && arrow !== '←' ? (
          <Animated.Text
            style={[styles.arrow, { fontSize: size, lineHeight: size * 1.5, color: t.blue, transform: [{ translateX: x }] }]}
          >
            {arrow}
          </Animated.Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center' },
  text: { fontFamily: 'FunnelSans_500Medium', textDecorationLine: 'underline' },
  arrow: { fontFamily: 'FunnelSans_500Medium', marginLeft: 6 },
  back: { fontFamily: 'FunnelSans_500Medium', marginRight: 6 },
  center: { alignSelf: 'center' },
});
