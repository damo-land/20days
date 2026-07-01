import { Fragment } from 'react';
import { View } from 'react-native';
import { useTheme } from 'react-native-paper';
import Svg, { Circle, Rect } from 'react-native-svg';
import { SCALE } from '@/config';
import { scoreColor } from '@/theme/category';
import type { DayPoint } from '@/trend/engine';

/**
 * The 20-days chart: one rounded column per day (the M3 Expressive "Steps" look). Height carries
 * the day's score; colour carries its value on the brand scale — the same score→colour mapping
 * as the rings and badges, so a day reads the same everywhere. Missed days are quiet baseline
 * dots; the most recent logged day gets a soft halo ("you, today"). No lines, no smoothing —
 * twenty days, twenty cells, exactly what was logged.
 */
export function DayBars({ data, width = 320, height = 96 }: { data: DayPoint[]; width?: number; height?: number }) {
  const theme = useTheme();
  const n = Math.max(data.length, 1);
  const gap = 5;
  const inset = 3; // side headroom so the end bars' halos never clip
  const barW = (width - 2 * inset - gap * (n - 1)) / n;
  const rx = Math.min(barW / 2, 6);
  const top = 6; // headroom so the halo never clips
  const usable = height - top;

  const lastLogged = (() => {
    for (let i = data.length - 1; i >= 0; i--) if (data[i].value != null) return i;
    return -1;
  })();

  return (
    <View>
      <Svg width={width} height={height}>
        {data.map((d, i) => {
          const x = inset + i * (barW + gap);
          if (d.value == null) {
            return <Circle key={i} cx={x + barW / 2} cy={height - 3} r={2.5} fill={theme.colors.outlineVariant} />;
          }
          const h = Math.max((d.value / SCALE.max) * usable, barW); // never shorter than a dot-pill
          const y = height - h;
          const c = scoreColor(d.value);
          return (
            <Fragment key={i}>
              {i === lastLogged ? (
                <Rect x={x - 3} y={y - 3} width={barW + 6} height={h + 6} rx={rx + 3} fill={c} opacity={0.25} />
              ) : null}
              <Rect x={x} y={y} width={barW} height={h} rx={rx} fill={c} />
            </Fragment>
          );
        })}
      </Svg>
    </View>
  );
}
