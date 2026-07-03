import { View } from 'react-native';
import Svg, { Circle, Line } from 'react-native-svg';
import { SCALE } from '@/config';
import { useTones } from '@/theme/ThemeProvider';
import type { DayPoint } from '@/trend/engine';

export interface DotTint {
  fill: string;
  faint: string;
  today: string;
}

/**
 * The day-dot strip (docs/DESIGN.md §5): literally one day, one dot — each day's dot sits at
 * its score's height (1 low … 5 high), so the trend reads as a rising or falling line of
 * dots. Missed day = a hollow faint dot on the baseline. Today = Prime Blue. A hairline
 * baseline grounds the strip; no bars, no axes, no smoothing.
 *
 * `tint` recolours the whole strip as ONE hue family (the Verdict's coral strips — state
 * colour goes INTO the dots, never a glow behind them).
 */
export function DayDots({
  data,
  width = 320,
  height = 96,
  tint,
}: {
  data: DayPoint[];
  width?: number;
  height?: number;
  tint?: DotTint;
}) {
  const t = useTones();
  const n = Math.max(data.length, 1);
  const gapX = 6;
  const d = Math.min(Math.floor((width - gapX * (n - 1)) / n), 12);
  const r = d / 2;
  const step = (height - d) / (SCALE.max - 1); // vertical distance per score point

  const fill = tint?.fill ?? t.ink;
  const faint = tint?.faint ?? t.faint;
  const today = tint?.today ?? t.blue;
  const lastIdx = data.length - 1;
  const baseY = height - 0.5;

  return (
    <View>
      <Svg width={width} height={height + 1}>
        <Line x1={0} y1={baseY} x2={width} y2={baseY} stroke={t.hair} strokeWidth={1} />
        {data.map((p, i) => {
          const cx = i * (d + gapX) + r;
          if (p.value == null) {
            // Missed day: a hollow dot resting on the baseline — honest, quiet.
            return <Circle key={p.date} cx={cx} cy={height - r} r={r - 1} stroke={faint} strokeWidth={1.5} fill="none" />;
          }
          const v = Math.max(SCALE.min, Math.min(SCALE.max, p.value));
          const cy = height - r - (v - SCALE.min) * step;
          return <Circle key={p.date} cx={cx} cy={cy} r={r} fill={i === lastIdx ? today : fill} />;
        })}
      </Svg>
    </View>
  );
}
