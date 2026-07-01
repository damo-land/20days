import { useEffect, useMemo, useRef } from 'react';
import { AccessibilityInfo, Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

const { height: H } = Dimensions.get('window');
const OVERSCAN = Math.ceil(H * 1.2); // panels taller than the screen so no gap shows on overshoot
const emphasizedAccelerate = Easing.bezier(0.3, 0, 0.8, 0.15);

/**
 * Multi-layered wipe — a calm M3-Expressive scene transition (forward Y-axis). A few full-bleed
 * panels sweep up with a small stagger (Standard near-critical spring, no bounce), briefly cover,
 * then continue off the top (emphasized-accelerate) to reveal the next screen. `onCovered` fires
 * while the screen is hidden (swap the route there); `onDone` fires after the reveal completes.
 *
 * Mount this as a ROOT overlay (in _layout) so it survives the navigation in onCovered.
 */
export function WipeTransition({
  colors,
  onCovered,
  onDone,
}: {
  colors: string[];
  onCovered: () => void;
  onDone: () => void;
}) {
  const y = useRef(colors.map(() => new Animated.Value(OVERSCAN))).current;

  const coverIn = useMemo(
    () => Animated.stagger(80, y.map((v) => Animated.spring(v, { toValue: 0, stiffness: 320, damping: 34, mass: 1, useNativeDriver: true }))),
    [y],
  );
  const revealOut = useMemo(
    () => Animated.stagger(56, y.map((v) => Animated.timing(v, { toValue: -OVERSCAN, duration: 460, easing: emphasizedAccelerate, useNativeDriver: true }))),
    [y],
  );

  useEffect(() => {
    let cancelled = false;
    AccessibilityInfo.isReduceMotionEnabled().then((reduced) => {
      if (cancelled) return;
      if (reduced) {
        y.forEach((v) => v.setValue(0));
        onCovered();
        setTimeout(() => !cancelled && onDone(), 200);
        return;
      }
      coverIn.start(({ finished }) => {
        if (!finished || cancelled) return;
        onCovered();
        setTimeout(() => {
          if (cancelled) return;
          revealOut.start(({ finished: f }) => f && !cancelled && onDone());
        }, 150);
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {colors.map((c, i) => (
        <Animated.View key={i} style={[styles.panel, { backgroundColor: c, transform: [{ translateY: y[i] }] }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { position: 'absolute', left: 0, right: 0, top: 0, height: OVERSCAN, borderBottomLeftRadius: 44, borderBottomRightRadius: 44 },
});
