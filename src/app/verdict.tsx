import { format } from 'date-fns';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { AnimatedCard } from '@/components/AnimatedCard';
import { DayBars } from '@/components/DayBars';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { SUPPORT_URL } from '@/config';
import { getNotesSince, getPillarScoreRowsSince, getScoreRowsSince, listPillars, recordVerdict } from '@/db/repo';
import { isoDaysAgo, todayISO } from '@/lib/date';
import { BRAND } from '@/theme/brand';
import { scoreColor } from '@/theme/category';
import { dialRadius } from '@/theme/expressive';
import { DISPLAY_FONT } from '@/theme/fonts';
import { pillarIcon } from '@/theme/pillarMeta';
import { trendColor } from '@/theme/trendColor';
import { useAppStore } from '@/state/store';
import { DEFAULT_TREND_CONFIG } from '@/trend/engine';
import { buildPillarTrends } from '@/trend/pillars';
import { refreshTrend } from '@/trend/refresh';
import { buildDailySeries } from '@/trend/series';
import { generateNarrative, type VerdictInput, type VerdictNarrative } from '@/verdict';
import { buildSummary } from '@/verdict/templatedNarrator';

/**
 * The checkpoint. Evidence-backed core: show the user their OWN logged data (recall is peak-end
 * biased), in plain, unhurried language (Brand Guidelines §05). When two pillars slide together
 * it's ONE screen — they usually share a cause. A narrator (on-device Apple model when available,
 * deterministic templated otherwise — never the cloud) reads the window into a calm summary,
 * grounded reflection questions, and the user's own most-telling notes. A single optional written
 * response makes the moment self-actionable. Three unpressured doors. Non-clinical. See
 * docs/SPEC.md §3, FUTURE_IDEAS.md #1.
 */
export default function VerdictScreen() {
  const cfg = DEFAULT_TREND_CONFIG;
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const dial = useAppStore((s) => s.dial);
  const setPillarsOpen = useAppStore((s) => s.setPillarsOpen);
  const radius = dialRadius(dial);
  const windowStart = isoDaysAgo(cfg.windowDays - 1);
  const windowEnd = todayISO();

  // Read the window once. Sliding = pillars whose OWN trend is declining (the composite can slide
  // while no single pillar crosses the gate — then we fall back to the composite chart).
  const data = useMemo(() => {
    const pillarRows = getPillarScoreRowsSince(windowStart);
    const trends = buildPillarTrends(pillarRows, listPillars(), cfg.windowDays, windowEnd);
    return {
      pillarRows,
      sliding: trends.filter((t) => t.state === 'declining'),
      composite: buildDailySeries(getScoreRowsSince(windowStart), cfg.windowDays, windowEnd),
      notes: getNotesSince(windowStart, 999), // all window notes (deduped by day); narrator picks the telling ones
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [windowStart, windowEnd]);

  const input: VerdictInput = useMemo(
    () => ({
      windowDays: cfg.windowDays,
      sliding: data.sliding.map((t) => ({ pillarId: t.pillarId, name: t.name })),
      notes: data.notes,
      pillarRows: data.pillarRows,
    }),
    [data, cfg.windowDays],
  );

  const summary = buildSummary(input); // instant + identical on both narrator paths — paint it immediately
  const [narrative, setNarrative] = useState<VerdictNarrative | null>(null);
  const [reflection, setReflection] = useState('');

  useEffect(() => {
    let alive = true;
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
    router.back();
    if (userAction === 'adjust') setPillarsOpen(true); // the sheet lives on Trend, right behind this modal
  };

  const getSupport = () => {
    Linking.openURL(SUPPORT_URL).catch(() => {});
    close('support');
  };

  const quoted = narrative?.quotedNotes ?? [];

  return (
    <ScrollView
      style={{ backgroundColor: BRAND.overlay }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 20 }]}
      automaticallyAdjustKeyboardInsets
      keyboardShouldPersistTaps="handled"
    >
      <AnimatedCard index={0} dial={dial}>
        <Text variant="labelMedium" style={[styles.eyebrow, { color: theme.colors.secondary }]}>
          ● Checkpoint
        </Text>
        <Text variant="displaySmall" style={styles.big}>
          Let's look together
        </Text>
        <Text variant="bodyMedium" style={styles.sub}>
          {summary}
        </Text>
      </AnimatedCard>

      <AnimatedCard
        index={1}
        dial={dial}
        style={[styles.card, { backgroundColor: theme.colors.elevation.level1, borderColor: theme.colors.outlineVariant, borderRadius: radius }]}
      >
        {data.sliding.length ? (
          data.sliding.map((t) => (
            <View key={t.pillarId} style={styles.strip}>
              <View style={styles.stripHead}>
                <Icon name={pillarIcon(t.name)} size={16} color={theme.colors.onSurface} />
                <Text variant="labelLarge" style={[styles.stripName, { color: theme.colors.onSurface }]}>
                  {t.name}
                </Text>
                <View style={[styles.dot, { backgroundColor: trendColor(t.state) }]} />
              </View>
              <DayBars data={t.points} width={W - 72} height={60} />
            </View>
          ))
        ) : (
          <DayBars data={data.composite} width={W - 72} height={96} />
        )}
      </AnimatedCard>

      {quoted.length ? (
        <AnimatedCard index={2} dial={dial} style={styles.notes}>
          <Text variant="labelMedium" style={[styles.eyebrow, { color: theme.colors.onSurfaceVariant }]}>
            In your own words
          </Text>
          {quoted.map((n) => (
            <View key={n.date} style={styles.noteRow}>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurface }}>
                “{n.note}”
              </Text>
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
                {format(new Date(`${n.date}T00:00:00`), 'EEEE d MMMM')}
              </Text>
            </View>
          ))}
        </AnimatedCard>
      ) : null}

      <AnimatedCard index={quoted.length ? 3 : 2} dial={dial}>
        <Text variant="titleMedium" style={styles.h}>
          A real problem, or a rough patch?
        </Text>
        <Text variant="bodyMedium" style={styles.sub}>
          A dip with a clear cause often passes; a slow, persistent slide can be worth acting on. Sit
          with these for a moment — there are no right answers, only yours.
        </Text>

        {(narrative?.questions ?? []).map((q) => (
          <View key={q.id} style={styles.qRow}>
            <Text style={[styles.qMark, { color: theme.colors.secondary }]}>—</Text>
            <Text variant="bodyMedium" style={[styles.qText, { color: theme.colors.onSurface }]}>
              {q.text}
            </Text>
          </View>
        ))}

        <TextInput
          mode="outlined"
          label="Reflect on your thoughts (optional)"
          value={reflection}
          onChangeText={setReflection}
          multiline
          numberOfLines={3} 
          style={styles.note}
          outlineStyle={styles.noteOutline}
        />

        <PressableScale
          dial={dial}
          onPress={() => close('ignore')}
          accessibilityLabel="Keep going"
          style={[styles.primary, { backgroundColor: theme.colors.primary, borderRadius: radius }]}
        >
          <Text style={{ fontFamily: 'Roboto_500Medium', fontSize: 18, color: theme.colors.onPrimary }}>Keep going</Text>
        </PressableScale>
        <Button
          mode="outlined"
          buttonColor={BRAND.overlay}
          textColor={theme.colors.onSurface}
          onPress={() => close('adjust')}
          style={styles.btn}
          contentStyle={styles.btnContent}
          labelStyle={styles.btnLabel}
        >
          Re-think my priorities
        </Button>
        <Button mode="text" onPress={getSupport} style={styles.btn} contentStyle={styles.btnContent} labelStyle={styles.btnLabel}>
          Find support
        </Button>
      </AnimatedCard>

      <Text variant="bodySmall" style={styles.footer}>
        20days helps you notice patterns. It is not medical advice. If you're in crisis, contact
        local emergency services or a crisis line.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 8, paddingBottom: 48 },
  eyebrow: { textTransform: 'uppercase', letterSpacing: 1.6 },
  big: { fontFamily: DISPLAY_FONT, letterSpacing: -0.5, marginTop: 2 },
  card: { borderRadius: 16, padding: 16, marginVertical: 14, borderWidth: 1, gap: 14 },
  strip: { gap: 8 },
  stripHead: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stripName: { flex: 1, fontFamily: 'Roboto_500Medium' },
  dot: { width: 9, height: 9, borderRadius: 5 },
  h: { marginTop: 8 },
  sub: { opacity: 0.75, marginTop: 6 },
  notes: { marginBottom: 14 },
  noteRow: { marginTop: 10 },
  qRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  qMark: { fontFamily: DISPLAY_FONT, fontSize: 16, lineHeight: 22 },
  qText: { flex: 1, lineHeight: 22 },
  note: { marginTop: 16, backgroundColor: 'transparent' },
  noteOutline: { borderRadius: 14 },
  primary: { marginTop: 16, height: 52, alignItems: 'center', justifyContent: 'center' },
  btn: { marginTop: 10, borderRadius: 16 },
  btnContent: { height: 54 },
  btnLabel: { fontSize: 16 },
  footer: { opacity: 0.6, marginTop: 24 },
});
