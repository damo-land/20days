import Svg, { Path } from 'react-native-svg';

/**
 * A scalloped "cookie" shape — one of the characteristic Material 3 Expressive shapes. Pure SVG
 * (no shape-library dep). Used as a soft, friendly motif for celebratory / confirmation moments.
 */
export function Scallop({ size = 96, color, bumps = 8 }: { size?: number; color: string; bumps?: number }) {
  const c = size / 2;
  const r = size * 0.4;
  const amp = size * 0.058;
  const steps = bumps * 14;
  let d = '';
  for (let i = 0; i <= steps; i++) {
    const a = (i / steps) * Math.PI * 2;
    const rr = r + amp * Math.cos(a * bumps);
    const x = c + rr * Math.cos(a);
    const y = c + rr * Math.sin(a);
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)} `;
  }
  return (
    <Svg width={size} height={size}>
      <Path d={`${d}Z`} fill={color} />
    </Svg>
  );
}
