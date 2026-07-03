import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Switch } from 'react-native-paper';
import { ensureDailyReminder } from '@/lib/notifications';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { settings } from '@/settings/settings';
import { TYPE } from '@/theme/brand';
import { useTones } from '@/theme/ThemeProvider';
import { motionTokens } from '@/theme/expressive';
import { PillButton } from './PillButton';

const pad = (n: number) => String(n).padStart(2, '0');

/** Slide-up reminder sheet (opened from Trend). Holds the one gentle daily reminder. */
export function ReminderSheet({ visible, onDismiss, dial }: { visible: boolean; onDismiss: () => void; dial: number }) {
  const t = useTones();
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
        style={[styles.sheet, { backgroundColor: t.paper, paddingBottom: insets.bottom + 20, transform: [{ translateY }] }]}
      >
        <View style={[styles.handle, { backgroundColor: t.faint }]} />
        <Text style={[TYPE.title, { color: t.ink, marginBottom: 10 }]}>Daily reminder</Text>
        <View style={[styles.row, { borderTopColor: t.hair }]}>
          <Text style={[TYPE.body, { color: t.ink }]}>Remind me</Text>
          <Switch value={on} onValueChange={setOn} color={t.ink} />
        </View>
        <View style={[styles.row, { borderTopColor: t.hair }]}>
          <Text style={[TYPE.body, { color: t.ink }]}>Time</Text>
          <DateTimePicker
            value={pickerDate}
            mode="time"
            display="compact"
            onChange={onTime}
            themeVariant={t.dark ? 'dark' : 'light'}
            accentColor={t.blue}
          />
        </View>
        <View style={styles.cta}>
          <PillButton label="Save" onPress={save} dial={dial} />
        </View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,10,9,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 24,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 20, opacity: 0.7 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderTopWidth: 1 },
  cta: { marginTop: 24 },
});
