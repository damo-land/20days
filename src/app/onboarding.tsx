import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';
import { AnimatedCard } from '@/components/AnimatedCard';
import { Icon, type IconName } from '@/components/Icon';
import { PillarPicker } from '@/components/PillarPicker';
import { PressableScale } from '@/components/PressableScale';
import { Wordmark } from '@/components/Wordmark';
import { createInitialPillars } from '@/db/repo';
import { settings } from '@/settings/settings';
import { useAppStore } from '@/state/store';
import { DISPLAY_FONT } from '@/theme/fonts';
import { refreshTrend } from '@/trend/refresh';

const HOW: { icon: IconName; title: string; desc: string }[] = [
  { icon: 'edit', title: 'Pick your three', desc: 'The areas that matter most right now.' },
  { icon: 'check', title: 'Score once a day', desc: 'Under a minute. Miss one, nothing breaks.' },
  { icon: 'activity', title: 'Watch the trend', desc: 'A gentle checkpoint if it drifts down.' },
];

/**
 * First-run onboarding: a short two-step intro — the *what & why* (wordmark, how-it-works points and
 * the slogan), then the pillar picker — before we create the 3 pillars. Stepped (not swiped) so it
 * stays reliable in Expo Go; each panel re-mounts through the M3 Expressive entrance.
 */
export default function Onboarding() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const dial = useAppStore((s) => s.dial);
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const ready = selected.length === 3;
  const last = step === 1;
  const started = useRef(false); // double-tap on Start must not run onboarding twice

  const start = () => {
    if (started.current) return;
    started.current = true;
    createInitialPillars(selected);
    settings.setOnboarded(true);
    refreshTrend();
    router.replace('/');
  };
  const next = () => (last ? start() : setStep((s) => s + 1));

  const ctaLabel = last ? 'Start tracking' : 'Continue';
  const ctaDisabled = last && !ready;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 24 }]} showsVerticalScrollIndicator={false}>
        <AnimatedCard key={step} index={0} dial={dial} style={styles.panel}>
          {step === 0 ? (
            <>
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
            </>
          ) : (
            <>
              <Text style={[styles.headline, { color: theme.colors.onSurface }]}>Choose your three.</Text>
              <Text variant="bodyMedium" style={[styles.body, { color: theme.colors.onSurfaceVariant }]}>
                Pick the parts of life that carry the most weight right now. You can change them later.
              </Text>
              <View style={styles.picker}>
                <PillarPicker selected={selected} onChange={setSelected} />
              </View>
              <Text variant="bodySmall" style={[styles.note, { color: theme.colors.onSurfaceVariant }]}>
                Private by design — your data stays on this device.
              </Text>
            </>
          )}
        </AnimatedCard>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: theme.colors.background, borderTopColor: theme.colors.outlineVariant }]}>
        <View style={styles.dots}>
          {[0, 1].map((i) => (
            <View key={i} style={[styles.dot, { width: i === step ? 22 : 8, backgroundColor: i === step ? theme.colors.primary : theme.colors.outlineVariant }]} />
          ))}
        </View>
        <PressableScale
          dial={dial}
          onPress={next}
          disabled={ctaDisabled}
          accessibilityLabel={ctaLabel}
          style={[styles.cta, { backgroundColor: ctaDisabled ? theme.colors.surfaceVariant : theme.colors.primary }]}
        >
          <Text style={{ fontFamily: 'Roboto_500Medium', fontSize: 18, color: ctaDisabled ? theme.colors.onSurfaceVariant : theme.colors.onPrimary }}>{ctaLabel}</Text>
        </PressableScale>
        {step > 0 ? (
          <PressableScale dial={dial} onPress={() => setStep((s) => Math.max(0, s - 1))} accessibilityLabel="Back" style={styles.back}>
            <Text style={{ color: theme.colors.onSurfaceVariant, fontFamily: 'Roboto_500Medium' }}>Back</Text>
          </PressableScale>
        ) : (
          <View style={styles.back} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, flexGrow: 1, paddingBottom: 24 },
  panel: { flex: 1, justifyContent: 'center', paddingVertical: 8 },
  // Type scale — one display size for the hero, one for the kicker, one title + one body for the list.
  headline: { fontFamily: DISPLAY_FONT, fontSize: 30, lineHeight: 37, letterSpacing: -0.5, marginTop: 24 },
  body: { marginTop: 12, lineHeight: 24 },
  steps: { marginTop: 36, gap: 22 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  stepIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  stepText: { flex: 1 },
  stepTitle: { fontFamily: 'Roboto_500Medium', fontSize: 16, lineHeight: 21 },
  stepDesc: { fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 19, marginTop: 2 },
  sloganBlock: { marginTop: 36 },
  sloganRule: { width: 32, height: 3, borderRadius: 2, marginBottom: 14 },
  slogan: { fontFamily: DISPLAY_FONT, fontSize: 19, lineHeight: 26, letterSpacing: -0.3 },
  picker: { marginTop: 24 },
  note: { marginTop: 24, opacity: 0.75, textAlign: 'center' },
  footer: { paddingHorizontal: 24, paddingTop: 14, borderTopWidth: StyleSheet.hairlineWidth },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 16 },
  dot: { height: 8, borderRadius: 4 },
  cta: { height: 54, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  back: { height: 40, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
});
