import { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { hexMix, onColorFor } from '@/theme/brand';
import { DISPLAY_FONT } from '@/theme/fonts';
import { Scallop } from './Scallop';

/**
 * A big score inside a characteristic M3 Expressive scalloped shape. The number of lobes tracks
 * the score (more corners = higher), and the shape springs/pops when the score changes — a
 * lightweight shape-morph. Filled in the pillar's colour when scored.
 */
export function ScoreBadge({
  value,
  color,
  surface,
  size = 60,
}: {
  value: number | null;
  color: string;
  surface: string;
  size?: number;
}) {
  const reduce = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const prev = useRef(value);

  useEffect(() => {
    if (prev.current !== value && !reduce) {
      scale.setValue(0.7);
      Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4.5, tension: 130 }).start();
    }
    prev.current = value;
  }, [value, reduce, scale]);

  const scored = value != null;
  const bumps = scored ? value + 3 : 7; // 1→4 … 5→8 lobes
  const fill = scored ? color : hexMix(surface, color, 0.16);

  return (
    <Animated.View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center', transform: [{ scale }] }}>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}>
        <Scallop size={size} color={fill} bumps={bumps} />
      </View>
      <Text
        style={{
          fontFamily: DISPLAY_FONT,
          fontSize: size * 0.46,
          lineHeight: size * 0.5,
          color: scored ? onColorFor(color) : hexMix(surface, color, 0.7),
        }}
      >
        {value ?? '–'}
      </Text>
    </Animated.View>
  );
}
