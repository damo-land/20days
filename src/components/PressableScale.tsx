import { type ReactNode, useRef } from 'react';
import { Animated, Pressable, type StyleProp, type ViewStyle } from 'react-native';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { motionTokens } from '@/theme/expressive';

/**
 * Press target that squishes on press-in and springs back (M3 Expressive fast spatial spring).
 * The dial tunes the bounce. Reduce-motion → no scaling.
 */
export function PressableScale({
  onPress,
  dial,
  style,
  children,
  disabled,
  accessibilityLabel,
  accessibilityRole = 'button',
  accessibilityState,
  hitSlop,
}: {
  onPress?: () => void;
  dial: number;
  style?: StyleProp<ViewStyle>;
  children: ReactNode;
  disabled?: boolean;
  accessibilityLabel?: string;
  accessibilityRole?: 'button' | 'adjustable';
  accessibilityState?: { selected?: boolean; disabled?: boolean };
  hitSlop?: number;
}) {
  const reduce = useReduceMotion();
  const s = useRef(new Animated.Value(1)).current;

  const to = (v: number) => {
    if (reduce) return;
    const { spatialFast } = motionTokens(dial, reduce);
    Animated.spring(s, { toValue: v, useNativeDriver: true, ...spatialFast }).start();
  };

  return (
    <Pressable
      onPressIn={() => to(0.95)}
      onPressOut={() => to(1)}
      onPress={onPress}
      disabled={disabled}
      hitSlop={hitSlop}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled, ...accessibilityState }}
    >
      <Animated.View style={[style, { transform: [{ scale: s }] }]}>{children}</Animated.View>
    </Pressable>
  );
}
