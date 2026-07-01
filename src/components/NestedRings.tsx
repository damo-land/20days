import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { hexMix } from '@/theme/brand';
import { DISPLAY_FONT } from '@/theme/fonts';
import { Icon, type IconName } from './Icon';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);
/** M3 emphasized-decelerate — the arcs sweep in and settle. */
const emphasizedDecelerate = Easing.bezier(0.05, 0.7, 0.1, 1);

export interface RingDatum {
  name: string;
  value: number | null;
  color: string;
  /** The pillar's identity icon, shown beside its legend label. */
  icon?: IconName;
}

const SWEEP = 0.75; // 3/4 ring (270°), not a full circle
const ROTATE = -90; // start the arc at 12 o'clock, sweeping clockwise → the 90° gap sits top-left

/**
 * Concentric 3/4 arcs (Apple-Fitness / Strava style), one per pillar in its own colour, filled to
 * its value. Built with the standard react-native-svg dash-array trick: the track shows 75% of the
 * circumference, the fill shows value/max of that 75%. The opening sits in the top-left quadrant,
 * where the per-pillar legend lives — right-aligned so the labels hug the arcs. Big centre number,
 * generous negative space.
 */
export function NestedRings({ rings, max, center, size = 262 }: { rings: RingDatum[]; max: number; center?: string; size?: number }) {
  const theme = useTheme();
  const reduce = useReduceMotion();
  const stroke = 15;
  const gap = 10;
  const c = size / 2;
  const radii = rings.map((_, i) => size / 2 - stroke / 2 - i * (stroke + gap));

  // One shared progress → each arc draws in from its start on mount (dashoffset trick;
  // SVG props can't use the native driver). Later data updates land instantly (t stays 1).
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduce) {
      t.setValue(1);
      return;
    }
    const anim = Animated.timing(t, { toValue: 1, duration: 900, delay: 120, easing: emphasizedDecelerate, useNativeDriver: false });
    anim.start();
    return () => anim.stop();
  }, [reduce, t]);

  return (
    <View style={{ width: size, height: size, alignSelf: 'center' }}>
      <Svg width={size} height={size}>
        {rings.map((r, i) => {
          const circ = 2 * Math.PI * radii[i];
          const track = circ * SWEEP;
          return (
            <Circle
              key={`t${i}`}
              cx={c}
              cy={c}
              r={radii[i]}
              stroke={hexMix(theme.colors.surface, r.color, 0.22)}
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${track} ${circ - track}`}
              rotation={ROTATE}
              originX={c}
              originY={c}
            />
          );
        })}
        {rings.map((r, i) => {
          if (r.value == null) return null;
          const circ = 2 * Math.PI * radii[i];
          const filled = circ * SWEEP * Math.max(0, Math.min(1, r.value / max));
          // Inner rings start a beat later — the fill blooms outward-in.
          const start = Math.min(0.2 * i, 0.4);
          const offset =
            start > 0
              ? t.interpolate({ inputRange: [0, start, 1], outputRange: [filled, filled, 0] })
              : t.interpolate({ inputRange: [0, 1], outputRange: [filled, 0] });
          return (
            <AnimatedCircle
              key={`f${i}`}
              cx={c}
              cy={c}
              r={radii[i]}
              stroke={r.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              fill="none"
              strokeDasharray={`${filled} ${circ}`}
              strokeDashoffset={offset}
              rotation={ROTATE}
              originX={c}
              originY={c}
            />
          );
        })}
      </Svg>

      {center ? (
        <View style={styles.center} pointerEvents="none">
          <Text style={{ fontFamily: DISPLAY_FONT, fontSize: size * 0.24, lineHeight: size * 0.26, color: theme.colors.onSurface }}>{center}</Text>
        </View>
      ) : null}

      {/* legend in the top-left opening — right-aligned so each label's right edge sits just left of
          the centre (where the arcs begin), at its own ring's cap height (no dots) */}
      {rings.map((r, i) => (
        <View key={`l${i}`} style={[styles.legendRow, { top: c - radii[i] - 10, right: c + 22 }]} pointerEvents="none">
          {r.icon ? <Icon name={r.icon} size={14} color={theme.colors.onSurfaceVariant} /> : null}
          <Text style={{ fontSize: 14, color: theme.colors.onSurfaceVariant }}>
            {r.name}{' '}
            <Text style={{ fontFamily: DISPLAY_FONT, fontSize: 16, color: r.color }}>{r.value ?? '–'}</Text>
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  legendRow: { position: 'absolute', flexDirection: 'row', alignItems: 'center', gap: 5 },
});
