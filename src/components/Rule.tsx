import { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { useTones } from '@/theme/ThemeProvider';

/**
 * The rule — the full-width 1px ink line under every screen headline (docs/DESIGN.md §5).
 * Enters with the "Draw" verb: it draws left → right on mount, then the headline's stop
 * settles above it. Reduce Motion → appears instantly.
 */
export function Rule({ marginTop = 14 }: { marginTop?: number }) {
  const t = useTones();
  const reduce = useReduceMotion();
  const w = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduce) {
      w.setValue(1);
      return;
    }
    const anim = Animated.timing(w, { toValue: 1, duration: 420, delay: 60, useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [reduce, w]);

  const width = w.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View style={{ marginTop, height: 1 }}>
      <Animated.View style={{ height: 1, width, backgroundColor: t.ink, opacity: 0.85 }} />
    </View>
  );
}
