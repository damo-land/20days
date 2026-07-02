import { format } from 'date-fns';
import { router } from 'expo-router';
import { Linking, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, useTheme } from 'react-native-paper';
import { AnimatedCard } from '@/components/AnimatedCard';
import { DayBars } from '@/components/DayBars';
import { PressableScale } from '@/components/PressableScale';
import { SUPPORT_URL } from '@/config';
import { getNotesSince, getPillarScoreRowsSince, getScoreRowsSince, listPillars, recordVerdict } from '@/db/repo';
import { isoDaysAgo, todayISO } from '@/lib/date';
import { BRAND } from '@/theme/brand';
import { dialRadius } from '@/theme/expressive';
import { DISPLAY_FONT } from '@/theme/fonts';
import { useAppStore } from '@/state/store';
import { DEFAULT_TREND_CONFIG } from '@/trend/engine';
import { buildPillarTrends, decliningPillars, joinNames } from '@/trend/pillars';
import { refreshTrend } from '@/trend/refresh';
import { buildDailySeries } from '@/trend/series';

/**
 * The checkpoint. Evidence-backed core: show the user their OWN logged data (recall is
 * peak-end biased), in plain, unhurried language (Brand Guidelines §05). Three unpressured
 * doors: keep going / re-think priorities / find support. Non-clinical. See docs/SPEC.md §3.
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
  const series = buildDailySeries(getScoreRowsSince(windowStart), cfg.windowDays, windowEnd);
  // Name what's actually sliding — the user's own pillars, their own words.
  const sliding = decliningPillars(buildPillarTrends(getPillarScoreRowsSince(windowStart), listPillars(), cfg.windowDays, windowEnd));
  const notes = getNotesSince(windowStart);

  const close = (userAction: 'ignore' | 'adjust' | 'support') => {
    recordVerdict({
      reason: 'negative_trend',
      windowStart,
      windowEnd,
      userAction,
      cooldownUntilMs: Date.now() + cfg.cooldownDays * 86_400_000,
    });
    refreshTrend();
    router.back();
    if (userAction === 'adjust') setPillarsOpen(true); // the sheet lives on Trend, right behind this modal
  };

  const getSupport = () => {
    Linking.openURL(SUPPORT_URL).catch(() => {});
    close('support');
  };

  return (
    <ScrollView
      style={{ backgroundColor: BRAND.overlay }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 20 }]}
    >
      <AnimatedCard index={0} dial={dial}>
        <Text variant="labelMedium" style={[styles.eyebrow, { color: theme.colors.secondary }]}>
          ● Checkpoint
        </Text>
        <Text variant="displaySmall" style={styles.big}>
          Let's look together
        </Text>
        <Text variant="bodyMedium" style={styles.sub}>
          {sliding.length
            ? `Your scores have drifted down over the last ${cfg.windowDays} days — ${joinNames(sliding)} most of all. `
            : `Your scores have drifted down over the last ${cfg.windowDays} days. `}
          This isn't a diagnosis — it's just what you logged.
        </Text>
      </AnimatedCard>

      <AnimatedCard
        index={1}
        dial={dial}
        style={[styles.card, { backgroundColor: theme.colors.elevation.level1, borderColor: theme.colors.outlineVariant, borderRadius: radius }]}
      >
        <DayBars data={series} width={W - 72} height={96} />
      </AnimatedCard>

      {notes.length ? (
        <AnimatedCard index={2} dial={dial} style={styles.notes}>
          <Text variant="labelMedium" style={[styles.eyebrow, { color: theme.colors.onSurfaceVariant }]}>
            In your own words
          </Text>
          {notes.map((n) => (
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

      <AnimatedCard index={notes.length ? 3 : 2} dial={dial}>
        <Text variant="titleMedium" style={styles.h}>
          A real problem, or a rough patch?
        </Text>
        <Text variant="bodyMedium" style={styles.sub}>
          Think about what's been going on. A dip with a clear cause often passes. A slow, persistent
          slide can be worth acting on. You decide what it means.
        </Text>

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
  card: { borderRadius: 16, padding: 16, marginVertical: 14, borderWidth: 1 },
  h: { marginTop: 8 },
  sub: { opacity: 0.75, marginTop: 6 },
  notes: { marginBottom: 14 },
  noteRow: { marginTop: 10 },
  primary: { marginTop: 12, height: 52, alignItems: 'center', justifyContent: 'center' },
  btn: { marginTop: 10, borderRadius: 16 },
  btnContent: { height: 54 },
  btnLabel: { fontSize: 16 },
  footer: { opacity: 0.6, marginTop: 24 },
});
