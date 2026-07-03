import { StyleSheet, Text } from 'react-native';
import { TYPE } from '@/theme/brand';
import { useTones } from '@/theme/ThemeProvider';
import { PressableScale } from './PressableScale';

/**
 * THE button (docs/DESIGN.md §4): one solid ink pill per screen at most, Funnel Display
 * label. Plain label — the blue stop is headline punctuation, never button decoration.
 * Everything below this weight is a text link.
 */
export function PillButton({
  label,
  onPress,
  dial,
  disabled,
}: {
  label: string;
  onPress: () => void;
  dial: number;
  disabled?: boolean;
}) {
  const t = useTones();
  return (
    <PressableScale
      dial={dial}
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={[styles.pill, { backgroundColor: t.ink, opacity: disabled ? 0.35 : 1 }]}
    >
      <Text style={{ fontFamily: TYPE.headline.fontFamily, fontSize: 18, color: t.paper }}>{label}</Text>
    </PressableScale>
  );
}

const styles = StyleSheet.create({
  pill: { height: 54, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
});
