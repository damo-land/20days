import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Switch, Text, useTheme } from 'react-native-paper';
import { ensureDailyReminder } from '@/lib/notifications';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { settings } from '@/settings/settings';
import { BRAND } from '@/theme/brand';
import { DISPLAY_FONT } from '@/theme/fonts';
import { motionTokens } from '@/theme/expressive';
import { PressableScale } from './PressableScale';

const pad = (n: number) => String(n).padStart(2, '0');

/** Slide-up reminder sheet (opened from the bell on Trend). Holds the one gentle daily reminder. */
export function ReminderSheet({ visible, onDismiss, dial }: { visible: boolean; onDismiss: () => void; dial: number }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const [on, setOn] = useState(settings.isReminderOn());
  const [time, setTime] = useState(settings.getReminderTime());
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    setOn(settings.isReminderOn());
    setTime(settings.getReminderTime());
    y.setValue(0);
    const { spatialDefault } = motionTokens(dial, reduce);
    Animated.spring(y, { toValue: 1, useNativeDriver: true, ...spatialDefault }).start();
  }, [visible, dial, reduce, y]);

  const save = async () => {
    settings.setReminderOn(on);
    settings.setReminderTime(time);
    await ensureDailyReminder(time, on);
    onDismiss();
  };

  const [hh, mm] = time.split(':').map(Number);
  const pickerDate = new Date();
  pickerDate.setHours(hh || 20, mm || 0, 0, 0);
  const onTime = (_e: DateTimePickerEvent, d?: Date) => {
    if (d) setTime(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
  };

  const translateY = y.interpolate({ inputRange: [0, 1], outputRange: [420, 0] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: y }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View
        style={[styles.sheet, { backgroundColor: BRAND.overlay, paddingBottom: insets.bottom + 20, transform: [{ translateY }] }]}
      >
        <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />
        <Text style={[styles.title, { color: theme.colors.onSurface }]}>Daily reminder</Text>
        <View style={styles.row}>
          <Text variant="bodyLarge">Remind me</Text>
          <Switch value={on} onValueChange={setOn} />
        </View>
        <View style={styles.row}>
          <Text variant="bodyLarge">Time</Text>
          <DateTimePicker value={pickerDate} mode="time" display="compact" onChange={onTime} themeVariant="light" accentColor={theme.colors.primary} />
        </View>
        <PressableScale
          dial={dial}
          onPress={save}
          accessibilityLabel="Save reminder"
          style={[styles.save, { backgroundColor: theme.colors.primary }]}
        >
          <Text style={{ fontFamily: 'Roboto_500Medium', fontSize: 18, color: theme.colors.onPrimary }}>Save</Text>
        </PressableScale>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(20,24,40,0.4)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 22, opacity: 0.7 },
  title: { fontFamily: DISPLAY_FONT, fontSize: 26, marginBottom: 22 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 20 },
  field: { marginTop: 12 },
  save: { marginTop: 32, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
});
