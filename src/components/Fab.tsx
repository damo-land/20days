import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';

/**
 * Big Material 3 Expressive FAB, bottom-right. Extended (icon + label) when it's the primary
 * call to log; the dial gives it the press-squish. Sits above the safe-area inset.
 */
export function Fab({
  dial,
  onPress,
  label,
  icon = 'plus',
}: {
  dial: number;
  onPress: () => void;
  label?: string;
  icon?: IconName;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const extended = !!label;

  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 16) }]} pointerEvents="box-none">
      <PressableScale
        dial={dial}
        onPress={onPress}
        accessibilityLabel={label ?? 'Log today'}
        style={[
          styles.fab,
          extended ? styles.extended : styles.round,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <Icon name={icon} size={26} color={theme.colors.onPrimary} strokeWidth={2.8} />
        {extended ? (
          <Text style={{ fontFamily: 'Roboto_500Medium', fontSize: 18, color: theme.colors.onPrimary }}>{label}</Text>
        ) : null}
      </PressableScale>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', right: 20, bottom: 0, alignItems: 'flex-end' },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  round: { width: 64, height: 64, borderRadius: 22 },
  extended: { height: 60, borderRadius: 30, paddingHorizontal: 24 },
});
