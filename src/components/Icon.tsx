import Svg, { Circle, Path, Polyline } from 'react-native-svg';

/**
 * Feather-style stroke icons, inlined as SVG paths (MIT, feathericons.com) so we pull no
 * icon dependency — same lean approach as the hand-rolled Sparkline. 24×24, 2px stroke,
 * round caps. Only the handful the app uses are here; add paths as needed.
 */
export type IconName =
  | 'home'
  | 'activity'
  | 'settings'
  | 'check'
  | 'plus'
  | 'bell'
  | 'edit'
  | 'info'
  | 'sliders'
  | 'heart'
  | 'moon'
  | 'briefcase'
  | 'dollar'
  | 'users'
  | 'book'
  | 'star'
  | 'leaf'
  | 'smile';

export function Icon({
  name,
  size = 24,
  color = '#000',
  strokeWidth = 2,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}) {
  const common = {
    stroke: color,
    strokeWidth,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    fill: 'none',
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'home' && (
        <>
          <Path {...common} d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <Polyline {...common} points="9 22 9 12 15 12 15 22" />
        </>
      )}
      {name === 'activity' && <Polyline {...common} points="22 12 18 12 15 21 9 3 6 12 2 12" />}
      {name === 'settings' && (
        <>
          <Circle {...common} cx={12} cy={12} r={3} />
          <Path
            {...common}
            d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
          />
        </>
      )}
      {name === 'check' && <Polyline {...common} points="20 6 9 17 4 12" />}
      {name === 'plus' && (
        <>
          <Path {...common} d="M12 5v14" />
          <Path {...common} d="M5 12h14" />
        </>
      )}
      {name === 'bell' && (
        <>
          <Path {...common} d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
          <Path {...common} d="M13.73 21a2 2 0 0 1-3.46 0" />
        </>
      )}
      {name === 'edit' && (
        <>
          <Path {...common} d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
          <Path {...common} d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </>
      )}
      {name === 'info' && (
        <>
          <Circle {...common} cx={12} cy={12} r={10} />
          <Path {...common} d="M12 16v-4" />
          <Path {...common} d="M12 8h.01" />
        </>
      )}
      {name === 'sliders' && (
        <>
          <Path {...common} d="M4 21v-7" />
          <Path {...common} d="M4 10V3" />
          <Path {...common} d="M12 21v-9" />
          <Path {...common} d="M12 8V3" />
          <Path {...common} d="M20 21v-5" />
          <Path {...common} d="M20 12V3" />
          <Path {...common} d="M1 14h6" />
          <Path {...common} d="M9 8h6" />
          <Path {...common} d="M17 16h6" />
        </>
      )}
      {name === 'heart' && (
        <Path {...common} d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      )}
      {name === 'moon' && <Path {...common} d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />}
      {name === 'briefcase' && (
        <>
          <Path {...common} d="M20 7H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z" />
          <Path {...common} d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
        </>
      )}
      {name === 'dollar' && (
        <>
          <Path {...common} d="M12 1v22" />
          <Path {...common} d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </>
      )}
      {name === 'users' && (
        <>
          <Path {...common} d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <Circle {...common} cx={9} cy={7} r={4} />
          <Path {...common} d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <Path {...common} d="M16 3.13a4 4 0 0 1 0 7.75" />
        </>
      )}
      {name === 'book' && (
        <>
          <Path {...common} d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <Path {...common} d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </>
      )}
      {name === 'star' && (
        <Path {...common} d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      )}
      {name === 'leaf' && (
        <>
          <Path {...common} d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
          <Path {...common} d="M2 21c0-3 1.85-5.36 5.08-6" />
        </>
      )}
      {name === 'smile' && (
        <>
          <Circle {...common} cx={12} cy={12} r={10} />
          <Path {...common} d="M8 14s1.5 2 4 2 4-2 4-2" />
          <Path {...common} d="M9 9h.01" />
          <Path {...common} d="M15 9h.01" />
        </>
      )}
    </Svg>
  );
}
