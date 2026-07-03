import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedCard } from '@/components/AnimatedCard';
import { PillarPicker } from '@/components/PillarPicker';
import { PillButton } from '@/components/PillButton';
import { Rule } from '@/components/Rule';
import { Stop } from '@/components/Stop';
import { TextLink } from '@/components/TextLink';
import { Wordmark } from '@/components/Wordmark';
import { createInitialPillars } from '@/db/repo';
import { settings } from '@/settings/settings';
import { useAppStore } from '@/state/store';
import { TYPE } from '@/theme/brand';
import { useTones } from '@/theme/ThemeProvider';
import { refreshTrend } from '@/trend/refresh';

const HOW: { title: string; desc: string }[] = [
  { title: 'Pick your three', desc: 'The areas that matter most right now.' },
  { title: 'Score once a day', desc: 'Under a minute. Miss one, nothing breaks.' },
  { title: 'Watch the trend', desc: 'A gentle checkpoint if it drifts down.' },
];

/**
 * First-run onboarding: a short two-step intro — the *what & why* (wordmark, how-it-works,
 * slogan), then the pillar picker — before we create the 3 pillars. Stepped (not swiped);
 * each panel re-mounts through the entrance spring.
 */
export default function Onboarding() {
  const t = useTones();
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

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 28 }]} showsVerticalScrollIndicator={false}>
        <AnimatedCard key={step} index={0} dial={dial} style={styles.panel}>
          {step === 0 ? (
            <>
              <Wordmark size={40} color={t.ink} />
              <Text style={[TYPE.display, styles.headline, { color: t.ink }]}>
                Notice the drift before it becomes the story
                <Stop size={TYPE.display.fontSize} />
              </Text>
              <Rule />
              <View style={styles.steps}>
                {HOW.map((h, i) => (
                  <View key={h.title} style={[styles.stepRow, i > 0 && { borderTopWidth: 1, borderTopColor: t.hair }]}>
                    <Text style={[TYPE.title, { color: t.ink }]}>{h.title}</Text>
                    <Text style={[TYPE.body, { color: t.faded, marginTop: 2 }]}>{h.desc}</Text>
                  </View>
                ))}
              </View>
              <Text style={[TYPE.body, styles.slogan, { color: t.faded }]}>
                Twenty days is enough to notice a pattern, right before it becomes a habit.
              </Text>
            </>
          ) : (
            <>
              <Text style={[TYPE.display, styles.headline, { color: t.ink }]}>
                Choose your three
                <Stop size={TYPE.display.fontSize} />
              </Text>
              <Rule />
              <Text style={[TYPE.body, { color: t.faded, marginTop: 14 }]}>
                Pick the parts of life that carry the most weight right now. You can change them later.
              </Text>
              <View style={styles.picker}>
                <PillarPicker selected={selected} onChange={setSelected} />
              </View>
              <Text style={[TYPE.label, styles.note, { color: t.faded }]}>
                Private by design. Your data stays on this device.
              </Text>
            </>
          )}
        </AnimatedCard>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 16, backgroundColor: t.paper, borderTopColor: t.hair }]}>
        {/* Progress: two circles — a step is a moment, so it's a dot; the current one is blue. */}
        <View style={styles.dots}>
          {[0, 1].map((i) => (
            <View key={i} style={[styles.dot, { backgroundColor: i === step ? t.blue : t.faint }]} />
          ))}
        </View>
        <PillButton label={last ? 'Start tracking' : 'Continue'} onPress={next} dial={dial} disabled={last && !ready} />
        {step > 0 ? (
          <View style={styles.back}>
            <TextLink label="back" arrow="←" onPress={() => setStep((s) => Math.max(0, s - 1))} color={t.faded} size={14} align="center" />
          </View>
        ) : (
          <View style={styles.backSpacer} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24, flexGrow: 1, paddingBottom: 24 },
  panel: { flex: 1, justifyContent: 'center', paddingVertical: 8 },
  headline: { marginTop: 22 },
  steps: { marginTop: 24 },
  stepRow: { paddingVertical: 16 },
  slogan: { marginTop: 10 },
  picker: { marginTop: 22 },
  note: { marginTop: 22, textAlign: 'center' },
  footer: { paddingHorizontal: 24, paddingTop: 14, borderTopWidth: 1 },
  dots: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 16 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  back: { marginTop: 12, alignItems: 'center' },
  backSpacer: { height: 34 },
});
