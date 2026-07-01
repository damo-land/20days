import { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, useTheme } from 'react-native-paper';
import { listPillars, snapshotPriorities, updatePillar } from '@/db/repo';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { BRAND } from '@/theme/brand';
import { DISPLAY_FONT } from '@/theme/fonts';
import { motionTokens } from '@/theme/expressive';
import { refreshTrend } from '@/trend/refresh';
import { PillarPicker } from './PillarPicker';
import { PressableScale } from './PressableScale';

/**
 * Edit the 3 pillars in the same slide-up sheet as About/Reminder (one overlay language app-wide).
 * Renaming keeps the existing 3 pillar slots in order (IDs + history intact) and snapshots the
 * change to priorities history. Opened from the Trend header and the Verdict "adjust" door.
 */
export function PillarsSheet({ visible, onDismiss, dial }: { visible: boolean; onDismiss: () => void; dial: number }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const y = useRef(new Animated.Value(0)).current;
  const [selected, setSelected] = useState<string[]>([]);
  const ready = selected.length === 3;

  useEffect(() => {
    if (!visible) return;
    setSelected(listPillars().map((p) => p.name));
    y.setValue(0);
    const { spatialDefault } = motionTokens(dial, reduce);
    Animated.spring(y, { toValue: 1, useNativeDriver: true, ...spatialDefault }).start();
  }, [visible, dial, reduce, y]);

  const save = () => {
    snapshotPriorities('edited pillars');
    listPillars().forEach((p, i) => {
      const name = selected[i]?.trim();
      if (name && name !== p.name) updatePillar(p.id, { name });
    });
    refreshTrend();
    onDismiss();
  };

  const translateY = y.interpolate({ inputRange: [0, 1], outputRange: [640, 0] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: y }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel="Close" />
      </Animated.View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { backgroundColor: BRAND.overlay, transform: [{ translateY }] }]}>
          <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[styles.title, { color: theme.colors.onSurface }]}>Your pillars</Text>
            <Text variant="bodyMedium" style={styles.sub}>
              The three things that carry the most weight right now. Change them as your life does.
            </Text>

            <View style={styles.picker}>
              <PillarPicker selected={selected} onChange={setSelected} />
            </View>

            <PressableScale
              dial={dial}
              onPress={save}
              disabled={!ready}
              accessibilityLabel="Save pillars"
              style={[styles.save, { backgroundColor: ready ? theme.colors.primary : theme.colors.surfaceVariant }]}
            >
              <Text style={{ fontFamily: 'Roboto_500Medium', fontSize: 18, color: ready ? theme.colors.onPrimary : theme.colors.onSurfaceVariant }}>
                Save pillars
              </Text>
            </PressableScale>

            <Button mode="text" onPress={onDismiss} textColor={theme.colors.onSurfaceVariant} style={styles.cancel}>
              Cancel
            </Button>

            <Text variant="bodySmall" style={styles.note}>
              Private by design — everything stays on this device.
            </Text>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(20,24,40,0.4)' },
  kav: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 10, opacity: 0.7 },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  title: { fontFamily: DISPLAY_FONT, fontSize: 26 },
  sub: { opacity: 0.75, marginTop: 8 },
  picker: { marginTop: 20 },
  save: { marginTop: 28, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  cancel: { marginTop: 8, alignSelf: 'center' },
  note: { marginTop: 14, opacity: 0.7, textAlign: 'center' },
});
