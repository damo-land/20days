import { type ReactNode, useEffect, useRef } from 'react';
import { Animated, type StyleProp, type ViewStyle } from 'react-native';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { motionTokens, staggerDelay } from '@/theme/expressive';

/**
 * A card that springs into place on mount (Material 3 Expressive spatial spring). The dial sets
 * how playful the spring is — gentle settle when grounded, a little overshoot when relaxed —
 * and staggers by index so a list blooms in sequence. Reduce-motion → appears instantly.
 */
export function AnimatedCard({
  children,
  index = 0,
  dial,
  style,
}: {
  children: ReactNode;
  index?: number;
  dial: number;
  style?: StyleProp<ViewStyle>;
}) {
  const reduce = useReduceMotion();
  const t = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduce) {
      t.setValue(1);
      return;
    }
    const { spatialDefault } = motionTokens(dial, reduce);
    const anim = Animated.spring(t, {
      toValue: 1,
      delay: staggerDelay(dial, index),
      useNativeDriver: true,
      ...spatialDefault,
    });
    anim.start();
    return () => anim.stop();
  }, [dial, index, reduce, t]);

  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [18, 0] });
  return <Animated.View style={[style, { opacity: t, transform: [{ translateY }] }]}>{children}</Animated.View>;
}
