import { type ReactNode, useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import Svg, { Defs, Ellipse, RadialGradient, Stop as SvgStop } from 'react-native-svg';
import { useReduceMotion } from '@/lib/useReduceMotion';

/**
 * The glow (docs/DESIGN.md §2): a soft radial breath of state colour behind ONE compact
 * block — a lone stat or a quoted note. Never behind dot clusters, sections or words.
 * Pulses slowly (the Breathe verb); Reduce Motion stills it.
 */
export function Glow({ color, children }: { color: string; children: ReactNode }) {
  const reduce = useReduceMotion();
  const breath = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduce) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breath, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(breath, { toValue: 0, duration: 2600, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduce, breath]);

  const opacity = breath.interpolate({ inputRange: [0, 1], outputRange: [0.28, 0.42] });

  return (
    <View>
      <Animated.View style={[StyleSheet.absoluteFill, styles.glow, { opacity }]} pointerEvents="none">
        <Svg width="100%" height="100%">
          <Defs>
            <RadialGradient id="g" cx="50%" cy="50%" rx="55%" ry="60%">
              <SvgStop offset="0%" stopColor={color} stopOpacity={1} />
              <SvgStop offset="100%" stopColor={color} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse cx="50%" cy="50%" rx="55%" ry="60%" fill="url(#g)" />
        </Svg>
      </Animated.View>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { margin: -14 },
});
