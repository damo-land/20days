import { format } from 'date-fns';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SUPPORT_URL } from '@/config';
import { getNotesSince, getPillarScoreRowsSince, getScoreRowsSince, listPillars, recordVerdict } from '@/db/repo';
import { isoDaysAgo, todayISO } from '@/lib/date';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { CORAL_DOTS, NUMBER_FONT, TYPE } from '@/theme/brand';
import { useTones } from '@/theme/ThemeProvider';
import { motionTokens } from '@/theme/expressive';
import { useAppStore } from '@/state/store';
import { DEFAULT_TREND_CONFIG, type DayPoint } from '@/trend/engine';
import { buildPillarTrends } from '@/trend/pillars';
import { refreshTrend } from '@/trend/refresh';
import { buildDailySeries } from '@/trend/series';
import { generateNarrative, type VerdictInput, type VerdictNarrative } from '@/verdict';
import { buildSummary } from '@/verdict/templatedNarrator';
import { DayDots } from './DayDots';
import { PillButton } from './PillButton';
import { Rule } from './Rule';
import { Stop } from './Stop';
import { TextLink } from './TextLink';

/**
 * The checkpoint — the app's ONLY coloured surface, in the SAME slide-up sheet as every other
 * overlay (one overlay language app-wide; it used to be a route modal and read inconsistent).
 * Evidence-backed core: the user's OWN logged data (recall is peak-end biased), in plain,
 * unhurried language. When two pillars slide together it's ONE sheet — they usually share a
 * cause. State colour goes INTO the dots (coral, tone on tone); movement is written
 * typographically (3.9 → 2.1). A narrator (on-device Apple model when available, deterministic
 * templated otherwise — never the cloud) reads the window into a calm summary, grounded
 * reflection questions, and the user's own most-telling notes. One optional written response
 * makes the moment self-actionable. Three unpressured doors; backdrop-dismiss records nothing
 * (agency). Non-clinical. See docs/SPEC.md §3.
 */

/** First-half vs second-half mean of the logged days — the slide, written as `a → b`. */
function windowDelta(points: DayPoint[]): { from: number; to: number } | null {
  const logged = points.filter((p) => p.value != null) as { date: string; value: number }[];
  if (logged.length < 4) return null;
  const half = Math.floor(logged.length / 2);
  const mean = (xs: { value: number }[]) => xs.reduce((a, x) => a + x.value, 0) / xs.length;
  return { from: mean(logged.slice(0, half)), to: mean(logged.slice(half)) };
}

export function VerdictSheet({ visible, onDismiss, dial }: { visible: boolean; onDismiss: () => void; dial: number }) {
  const cfg = DEFAULT_TREND_CONFIG;
  const t = useTones();
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const { width: W } = useWindowDimensions();
  const setPillarsOpen = useAppStore((s) => s.setPillarsOpen);
  const y = useRef(new Animated.Value(0)).current;
  const windowStart = isoDaysAgo(cfg.windowDays - 1);
  const windowEnd = todayISO();
  const coral = CORAL_DOTS[t.dark ? 'dark' : 'light'];

  useEffect(() => {
    if (!visible) return;
    y.setValue(0);
    const { spatialDefault } = motionTokens(dial, reduce);
    Animated.spring(y, { toValue: 1, useNativeDriver: true, ...spatialDefault }).start();
  }, [visible, dial, reduce, y]);

  // Read the window when the sheet opens. Sliding = pillars whose OWN trend is declining (the
  // composite can slide while no single pillar crosses the gate — then we show the composite).
  const data = useMemo(() => {
    if (!visible) return null;
    const pillarRows = getPillarScoreRowsSince(windowStart);
    const trends = buildPillarTrends(pillarRows, listPillars(), cfg.windowDays, windowEnd);
    return {
      pillarRows,
      sliding: trends.filter((tr) => tr.state === 'declining'),
      composite: buildDailySeries(getScoreRowsSince(windowStart), cfg.windowDays, windowEnd),
      notes: getNotesSince(windowStart, 999), // all window notes (deduped by day); narrator picks the telling ones
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible, windowStart, windowEnd]);

  const input: VerdictInput | null = useMemo(
    () =>
      data && {
        windowDays: cfg.windowDays,
        sliding: data.sliding.map((tr) => ({ pillarId: tr.pillarId, name: tr.name })),
        notes: data.notes,
        pillarRows: data.pillarRows,
      },
    [data, cfg.windowDays],
  );

  const summary = input ? buildSummary(input) : ''; // instant + identical on both narrator paths
  const [narrative, setNarrative] = useState<VerdictNarrative | null>(null);
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    if (!input) return;
    let alive = true;
    setNarrative(null);
    setReflection('');
    generateNarrative(input).then((n) => alive && setNarrative(n));
    return () => {
      alive = false;
    };
  }, [input]);

  const close = (userAction: 'ignore' | 'adjust' | 'support') => {
    recordVerdict({
      reason: 'negative_trend',
      windowStart,
      windowEnd,
      userAction,
      cooldownUntilMs: Date.now() + cfg.cooldownDays * 86_400_000,
      reflection, // the user's own words for this moment, saved locally with the event (may be empty)
    });
    refreshTrend();
    onDismiss();
    // The pillars sheet takes this one's place — one Modal can't swap for another same-tick.
    if (userAction === 'adjust') setTimeout(() => setPillarsOpen(true), 300);
  };

  const getSupport = () => {
    Linking.openURL(SUPPORT_URL).catch(() => {});
    close('support');
  };

  const quoted = narrative?.quotedNotes ?? [];
  const chartW = W - 48;
  const translateY = y.interpolate({ inputRange: [0, 1], outputRange: [720, 0] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: y }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel="Close checkpoint" />
      </Animated.View>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.kav} pointerEvents="box-none">
        <Animated.View style={[styles.sheet, { backgroundColor: t.paper, transform: [{ translateY }] }]}>
          <View style={[styles.handle, { backgroundColor: t.faint }]} />
          <ScrollView
            contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 28 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={[TYPE.micro, { color: t.faded }]}>Checkpoint</Text>
            <Text style={[TYPE.display, styles.headline, { color: t.ink }]}>
              Worth a look
              <Stop size={TYPE.display.fontSize} />
            </Text>
            <Rule />
            <Text style={[TYPE.body, { color: t.faded, marginTop: 14 }]}>{summary}</Text>

            <View style={styles.strips}>
              {data?.sliding.length ? (
                data.sliding.map((tr) => {
                  const delta = windowDelta(tr.points);
                  return (
                    <View key={tr.pillarId} style={styles.strip}>
                      <View style={styles.stripHead}>
                        <Text style={[TYPE.title, { color: t.ink }]}>{tr.name}</Text>
                        {delta ? (
                          <Text style={[styles.delta, { color: coral.today }]}>
                            {delta.from.toFixed(1)} → {delta.to.toFixed(1)}
                          </Text>
                        ) : null}
                      </View>
                      {/* State colour goes INTO the dots — one hue family, no glow (DESIGN.md §2). */}
                      <DayDots data={tr.points} width={chartW} tint={coral} />
                    </View>
                  );
                })
              ) : data ? (
                <DayDots data={data.composite} width={chartW} tint={coral} />
              ) : null}
            </View>

            {quoted.length ? (
              <View style={styles.notes}>
                <Text style={[TYPE.micro, { color: t.faded }]}>In your own words</Text>
                {quoted.map((n) => (
                  <View key={n.date} style={[styles.noteRow, { borderLeftColor: t.ink }]}>
                    <Text style={[TYPE.body, { color: t.ink }]}>“{n.note}”</Text>
                    <Text style={[TYPE.label, { color: t.faded, marginTop: 2 }]}>
                      {format(new Date(`${n.date}T00:00:00`), 'EEEE d MMMM')}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Text style={[TYPE.headline, styles.h, { color: t.ink }]}>A real problem,{'\n'}or a rough patch?</Text>
            <Text style={[TYPE.body, { color: t.faded, marginTop: 8 }]}>
              A dip with a clear cause often passes; a slow, persistent slide can be worth acting on.
              Sit with these for a moment. There are no right answers, only yours.
            </Text>

            {(narrative?.questions ?? []).map((q) => (
              <Text key={q.id} style={[TYPE.body, styles.qText, { color: t.ink }]}>
                {q.text}
              </Text>
            ))}

            <Text style={[TYPE.micro, { color: t.faded, marginTop: 24 }]}>Your take · optional</Text>
            <TextInput
              value={reflection}
              onChangeText={setReflection}
              placeholder="write it down, it stays on this device…"
              placeholderTextColor={t.faded}
              multiline
              style={[styles.reflect, { color: t.ink, borderColor: t.hair }]}
              accessibilityLabel="Your take (optional)"
            />

            {/* Three unpressured doors. The gentlest is the visible default (a clear affordance,
                not pressure); the other two stay editorial links. All dismissible (agency). */}
            <View style={styles.doors}>
              <PillButton label="It's a blip, keep going" onPress={() => close('ignore')} dial={dial} />
              <View style={styles.doorLinks}>
                <TextLink label="adjust my priorities" onPress={() => close('adjust')} />
                <TextLink label="find support" arrow="→" onPress={getSupport} />
              </View>
            </View>

            <Text style={[TYPE.label, styles.footer, { color: t.faded }]}>
              20days helps you notice patterns. It is not medical advice. If you're in crisis,
              contact local emergency services or a crisis line.
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
  sheet: { maxHeight: '93%', borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 12 },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 10, opacity: 0.7 },
  content: { paddingHorizontal: 24, paddingTop: 8 },
  headline: { marginTop: 8 },
  strips: { marginTop: 24, gap: 22 },
  strip: { gap: 10 },
  stripHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  delta: { fontFamily: NUMBER_FONT, fontSize: 16, fontVariant: ['tabular-nums'] },
  notes: { marginTop: 28 },
  noteRow: { marginTop: 12, borderLeftWidth: 2, paddingLeft: 12 },
  h: { marginTop: 30 },
  qText: { marginTop: 14 },
  reflect: {
    marginTop: 8,
    fontFamily: 'FunnelSans_400Regular',
    fontSize: 16,
    lineHeight: 22,
    padding: 14,
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 88,
    textAlignVertical: 'top',
  },
  doors: { marginTop: 26 },
  doorLinks: { marginTop: 18, gap: 16 },
  footer: { marginTop: 32 },
});
