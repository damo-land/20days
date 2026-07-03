import { useEffect, useRef, useState } from 'react';
import { Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { applyPillarEdit, listPillars, recordVerdict } from '@/db/repo';
import { isoDaysAgo, todayISO } from '@/lib/date';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { TYPE } from '@/theme/brand';
import { useTones } from '@/theme/ThemeProvider';
import { motionTokens } from '@/theme/expressive';
import { DEFAULT_TREND_CONFIG } from '@/trend/engine';
import { refreshTrend } from '@/trend/refresh';
import { PillarPicker } from './PillarPicker';
import { PillButton } from './PillButton';
import { TextLink } from './TextLink';

/**
 * Edit the 3 pillars in the same slide-up sheet as About/Reminder (one overlay language
 * app-wide). A name that stays keeps its pillar (id + history, matched by name); a swapped
 * name archives the old pillar and starts a brand-new one with zero history — a replacement
 * must never inherit the old pillar's data. Opened from Trend and the Verdict "adjust" door.
 */
export function PillarsSheet({
  visible,
  onDismiss,
  onSaved,
  dial,
}: {
  visible: boolean;
  onDismiss: () => void;
  onSaved?: () => void;
  dial: number;
}) {
  const t = useTones();
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
    const edit = applyPillarEdit(selected);
    if (edit.replaced) {
      // A replaced pillar is a deliberate reset — restart the checkpoint cooldown (same
      // mechanism as a Verdict Day) so we don't alarm about a pillar the user just acted on.
      recordVerdict({
        reason: 'pillar_change',
        windowStart: isoDaysAgo(DEFAULT_TREND_CONFIG.windowDays - 1),
        windowEnd: todayISO(),
        userAction: 'adjust',
        cooldownUntilMs: Date.now() + DEFAULT_TREND_CONFIG.cooldownDays * 86_400_000,
      });
    }
    if (edit.changed) {
      refreshTrend();
      onSaved?.();
    }
    onDismiss();
  };

  const translateY = y.interpolate({ inputRange: [0, 1], outputRange: [640, 0] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: y }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel="Close" />
      </Animated.View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { backgroundColor: t.paper, transform: [{ translateY }] }]}>
          <View style={[styles.handle, { backgroundColor: t.faint }]} />
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[TYPE.title, { color: t.ink }]}>Your pillars</Text>
            <Text style={[TYPE.body, { color: t.faded, marginTop: 6 }]}>
              The three things that carry the most weight right now. Change them as your life does.
            </Text>

            <View style={styles.picker}>
              <PillarPicker selected={selected} onChange={setSelected} />
            </View>

            <View style={styles.cta}>
              <PillButton label="Save pillars" onPress={save} dial={dial} disabled={!ready} />
            </View>
            <View style={styles.cancel}>
              <TextLink label="cancel" onPress={onDismiss} color={t.faded} size={14} align="center" />
            </View>

            <Text style={[TYPE.label, styles.note, { color: t.faded }]}>
              Private by design. Everything stays on this device.
            </Text>
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,10,9,0.45)' },
  kav: { flex: 1, justifyContent: 'flex-end' },
  sheet: { maxHeight: '90%', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 10, opacity: 0.7 },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  picker: { marginTop: 20 },
  cta: { marginTop: 26 },
  cancel: { marginTop: 14, alignItems: 'center' },
  note: { marginTop: 16, textAlign: 'center' },
});
