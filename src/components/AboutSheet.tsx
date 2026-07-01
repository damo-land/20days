import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { BRAND } from '@/theme/brand';
import { DISPLAY_FONT } from '@/theme/fonts';
import { motionTokens } from '@/theme/expressive';
import { Icon, type IconName } from './Icon';
import { PressableScale } from './PressableScale';
import { Wordmark } from './Wordmark';

const HOW: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'edit', title: 'Pick your three', desc: 'The areas that matter most right now.' },
  { icon: 'check', title: 'Score once a day', desc: 'Under a minute. Miss one, nothing breaks.' },
  { icon: 'activity', title: 'Watch the trend', desc: 'A gentle checkpoint if it drifts down.' },
];

/** The what & why — the same intro copy and type scale as onboarding, reachable any time from the
 *  Trend header's info icon. */
export function AboutSheet({ visible, onDismiss, dial }: { visible: boolean; onDismiss: () => void; dial: number }) {
  const theme = useTheme();
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
      <Animated.View style={[styles.sheet, { backgroundColor: BRAND.overlay, transform: [{ translateY }] }]}>
        <View style={[styles.handle, { backgroundColor: theme.colors.outlineVariant }]} />
        <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]} showsVerticalScrollIndicator={false}>
          <Wordmark size={44} color={theme.colors.onSurface} />
          <Text style={[styles.headline, { color: theme.colors.onSurface }]}>Notice the drift before it becomes the story.</Text>

          <View style={styles.steps}>
            {HOW.map((h) => (
              <View key={h.title} style={styles.stepRow}>
                <View style={[styles.stepIcon, { backgroundColor: theme.colors.elevation.level2 }]}>
                  <Icon name={h.icon} size={20} color={theme.colors.primary} strokeWidth={2.2} />
                </View>
                <View style={styles.stepText}>
                  <Text style={[styles.stepTitle, { color: theme.colors.onSurface }]}>{h.title}</Text>
                  <Text style={[styles.stepDesc, { color: theme.colors.onSurfaceVariant }]}>{h.desc}</Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.sloganBlock}>
            <View style={[styles.sloganRule, { backgroundColor: theme.colors.primary }]} />
            <Text style={[styles.slogan, { color: theme.colors.onSurface }]}>Enough to notice a pattern — right before it becomes a habit.</Text>
          </View>

          <Text style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>Private by design — your data stays on this device.</Text>

          <PressableScale dial={dial} onPress={onDismiss} accessibilityLabel="Close about" style={[styles.cta, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.ctaLabel, { color: theme.colors.onPrimary }]}>Got it</Text>
          </PressableScale>
        </ScrollView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(20,24,40,0.4)' },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, maxHeight: '88%', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 10, opacity: 0.7 },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  // Shared scale with onboarding: headline 30 · title 16 · desc 14 · slogan 19.
  headline: { fontFamily: DISPLAY_FONT, fontSize: 30, lineHeight: 37, letterSpacing: -0.5, marginTop: 20 },
  steps: { marginTop: 32, gap: 22 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepText: { flex: 1 },
  stepTitle: { fontFamily: 'Roboto_500Medium', fontSize: 16, lineHeight: 21 },
  stepDesc: { fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 19, marginTop: 2 },
  sloganBlock: { marginTop: 32 },
  sloganRule: { width: 32, height: 3, borderRadius: 2, marginBottom: 14 },
  slogan: { fontFamily: DISPLAY_FONT, fontSize: 19, lineHeight: 26, letterSpacing: -0.3 },
  note: { fontFamily: 'Roboto_400Regular', fontSize: 13, lineHeight: 18, marginTop: 24, opacity: 0.75 },
  cta: { marginTop: 24, height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  ctaLabel: { fontFamily: 'Roboto_500Medium', fontSize: 18 },
});
