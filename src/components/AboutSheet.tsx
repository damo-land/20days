import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { TYPE } from '@/theme/brand';
import { useTones } from '@/theme/ThemeProvider';
import { motionTokens } from '@/theme/expressive';
import { PillButton } from './PillButton';
import { Wordmark } from './Wordmark';

const HOW: { title: string; desc: string }[] = [
  { title: 'Pick your three', desc: 'The areas that matter most right now.' },
  { title: 'Score once a day', desc: 'Under a minute. Miss one, nothing breaks.' },
  { title: 'Watch the trend', desc: 'A gentle checkpoint if it drifts down.' },
];

/** The what & why — the same editorial copy as onboarding, reachable any time from Trend. */
export function AboutSheet({ visible, onDismiss, dial }: { visible: boolean; onDismiss: () => void; dial: number }) {
  const t = useTones();
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    y.setValue(0);
    const { spatialDefault } = motionTokens(dial, reduce);
    Animated.spring(y, { toValue: 1, useNativeDriver: true, ...spatialDefault }).start();
  }, [visible, dial, reduce, y]);

  const translateY = y.interpolate({ inputRange: [0, 1], outputRange: [560, 0] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: y }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel="Close" />
      </Animated.View>
      <Animated.View style={[styles.sheet, { backgroundColor: t.paper, transform: [{ translateY }] }]}>
        <View style={[styles.handle, { backgroundColor: t.faint }]} />
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
          <Wordmark size={40} color={t.ink} />
          <Text style={[TYPE.headline, styles.headline, { color: t.ink }]}>Notice the drift before it becomes the story.</Text>

          <View style={styles.steps}>
            {HOW.map((h) => (
              <View key={h.title} style={[styles.stepRow, { borderTopColor: t.hair }]}>
                <Text style={[TYPE.title, { color: t.ink }]}>{h.title}</Text>
                <Text style={[TYPE.body, { color: t.faded, marginTop: 2 }]}>{h.desc}</Text>
              </View>
            ))}
          </View>

          <Text style={[TYPE.body, styles.note, { color: t.faded }]}>Private by design. Your data stays on this device.</Text>

          <View style={styles.cta}>
            <PillButton label="Got it" onPress={onDismiss} dial={dial} />
          </View>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,10,9,0.45)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '88%', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 10, opacity: 0.7 },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  headline: { marginTop: 22 },
  steps: { marginTop: 26 },
  stepRow: { borderTopWidth: 1, paddingVertical: 16 },
  note: { marginTop: 8 },
  cta: { marginTop: 24 },
});
