import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, useTheme } from 'react-native-paper';
import { AboutSheet } from '@/components/AboutSheet';
import { AnimatedCard } from '@/components/AnimatedCard';
import { Fab } from '@/components/Fab';
import { Icon, type IconName } from '@/components/Icon';
import { NestedRings, type RingDatum } from '@/components/NestedRings';
import { PillarsSheet } from '@/components/PillarsSheet';
import { PressableScale } from '@/components/PressableScale';
import { ReminderSheet } from '@/components/ReminderSheet';
import { DayBars } from '@/components/DayBars';
import { SegmentedFilter } from '@/components/SegmentedFilter';
import { SCALE } from '@/config';
import { getEntriesForDate, getPillarScoreRowsSince, listPillars } from '@/db/repo';
import { isoDaysAgo, todayISO } from '@/lib/date';
import { settings } from '@/settings/settings';
import { hexMix } from '@/theme/brand';
import { scoreColor } from '@/theme/category';
import { accentEnergy, dialRadius } from '@/theme/expressive';
import { DISPLAY_FONT } from '@/theme/fonts';
import { pillarIcon } from '@/theme/pillarMeta';
import { trendColor } from '@/theme/trendColor';
import { useAppStore } from '@/state/store';
import { DEFAULT_TREND_CONFIG, type DayPoint } from '@/trend/engine';
import { buildPillarTrends, decliningPillars, joinNames, pillarHighlight, type PillarTrend } from '@/trend/pillars';
import { refreshTrend } from '@/trend/refresh';
import { buildDailySeries } from '@/trend/series';

const NEUTRAL_SCORE = (SCALE.min + SCALE.max) / 2; // scale midpoint — matches the trend engine's neutral fill

function statsOf(points: DayPoint[], neutral: number) {
  // Average treats unlogged days as neutral (an "unknown = neutral" prior, matching the trend
  // engine); the logged count stays the real number of days scored.
  const logged = points.filter((p) => p.value != null).length;
  const avg = points.length ? points.reduce((a, p) => a + (p.value ?? neutral), 0) / points.length : null;
  return { avg, logged };
}

/** Current run of recent days at a positive level (≥4/5). A missed day doesn't break it. */
function positiveStreak(points: DayPoint[]): number {
  let n = 0;
  for (let i = points.length - 1; i >= 0; i--) {
    const v = points[i].value;
    if (v == null) continue;
    if (v >= 4) n += 1;
    else break;
  }
  return n;
}

export default function TrendHome() {
  const cfg = DEFAULT_TREND_CONFIG;
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const [series, setSeries] = useState<DayPoint[]>([]);
  const [trends, setTrends] = useState<PillarTrend[]>([]);
  const [latest, setLatest] = useState<Record<number, number | null>>({});
  const [hasToday, setHasToday] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [filter, setFilter] = useState(-1); // -1 = All, else pillar index
  const trendState = useAppStore((s) => s.trendState);
  const confident = useAppStore((s) => s.trend?.confident ?? false);
  const verdictReady = useAppStore((s) => s.verdictReady);
  const dial = useAppStore((s) => s.dial);
  const pillarsOpen = useAppStore((s) => s.pillarsOpen);
  const setPillarsOpen = useAppStore((s) => s.setPillarsOpen);

  // Gate runs once per launch, inside the focus effect so navigation is guaranteed ready.
  const gateRan = useRef(false);

  // Also called directly after the pillars sheet saves — a Modal closing fires no focus event.
  const load = useCallback(() => {
    const date = todayISO();
    const windowStart = isoDaysAgo(cfg.windowDays - 1);
    const rows = getPillarScoreRowsSince(windowStart);
    setSeries(buildDailySeries(rows, cfg.windowDays, date));
    const loggedToday = getEntriesForDate(date).length > 0;
    setHasToday(loggedToday);
    const pillars = listPillars();
    setTrends(buildPillarTrends(rows, pillars, cfg.windowDays, date));
    const lt: Record<number, number | null> = {};
    const byPillar: Record<number, { date: string; score: number }> = {};
    for (const r of rows) {
      const cur = byPillar[r.pillarId];
      if (!cur || r.date > cur.date) byPillar[r.pillarId] = { date: r.date, score: r.score };
    }
    pillars.forEach((p) => (lt[p.id] = byPillar[p.id]?.score ?? null));
    setLatest(lt);
    refreshTrend();

    if (!gateRan.current) {
      gateRan.current = true;
      if (settings.isOnboarded() && pillars.length > 0 && !loggedToday && !settings.isTodayDismissed(date)) router.push('/today');
    }
  }, [cfg.windowDays]);

  useFocusEffect(load);

  const logged = series.filter((p) => p.value != null);
  const current = logged.length ? (logged[logged.length - 1].value as number) : null;

  const rings: RingDatum[] = trends.map((t) => ({
    name: t.name,
    value: latest[t.pillarId] ?? null,
    color: scoreColor(latest[t.pillarId] ?? null),
    icon: pillarIcon(t.name),
  }));

  // Chart follows the filter: All = composite (trend colour), else the pillar's own value colour.
  const chartPoints = filter === -1 ? series : trends[filter]?.points ?? [];
  const chartColor = filter === -1 ? accentEnergy(dial, trendColor(trendState)) : scoreColor(latest[trends[filter]?.pillarId] ?? null);
  const stats = statsOf(chartPoints, NEUTRAL_SCORE);
  const streak = positiveStreak(chartPoints);

  // A personal reading only once there's enough real data; below that we stay low-confidence.
  const highlight = confident ? pillarHighlight(trends) : null;
  const sliding = decliningPillars(trends);

  const radius = Math.max(dialRadius(dial), 24);

  const HeaderIcon = ({ icon, label, onPress }: { icon: IconName; label: string; onPress: () => void }) => (
    <PressableScale dial={dial} onPress={onPress} accessibilityLabel={label} style={[styles.iconBtn, { backgroundColor: theme.colors.elevation.level2 }]}>
      <Icon name={icon} size={21} color={theme.colors.onSurfaceVariant} />
    </PressableScale>
  );

  // Redirect covers the desync case too: onboarded flag set but no pillars in the DB.
  if (!settings.isOnboarded() || listPillars().length === 0) return <Redirect href="/onboarding" />;

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 16, paddingBottom: 160 }]}>
        <AnimatedCard index={0} dial={dial}>
          <View style={styles.topBar}>
            <Text variant="labelMedium" style={[styles.eyebrow, { color: theme.colors.onSurfaceVariant }]}>
              Last {cfg.windowDays} days
            </Text>
            <View style={styles.actions}>
              <HeaderIcon icon="info" label="About 20days" onPress={() => setAboutOpen(true)} />
              <HeaderIcon icon="bell" label="Reminder" onPress={() => setReminderOpen(true)} />
              <HeaderIcon icon="sliders" label="Edit pillars" onPress={() => setPillarsOpen(true)} />
            </View>
          </View>
          <Text variant="displayMedium" style={styles.big}>
            Your trend
          </Text>
          {!confident ? (
            <Text variant="bodyMedium" style={[styles.learningLine, { color: theme.colors.onSurfaceVariant }]}>
              Still learning about you — keep checking in and your trend comes into focus.
            </Text>
          ) : null}
        </AnimatedCard>

        {/* Hero — 3/4 rings sit open on the surface (no card); legend lives in the ring's top-left opening */}
        <AnimatedCard index={1} dial={dial} style={styles.hero}>
          <NestedRings rings={rings} max={SCALE.max} center={current != null ? current.toFixed(1) : '–'} size={258} />
          {highlight ? (
            <Text variant="titleMedium" style={[styles.highlight, { color: theme.colors.onSurface }]}>
              {highlight}
            </Text>
          ) : null}
        </AnimatedCard>

        {/* Chart — full-bleed, no card, with a segmented pillar filter */}
        <AnimatedCard index={2} dial={dial} style={styles.chartSection}>
          <SegmentedFilter
            options={[{ key: '-1', label: 'All' }, ...trends.map((t, i) => ({ key: String(i), label: t.name }))]}
            selectedKey={String(filter)}
            onSelect={(k) => setFilter(Number(k))}
            dial={dial}
            colorFor={(k) => (k === '-1' ? theme.colors.primary : scoreColor(latest[trends[Number(k)]?.pillarId] ?? null))}
          />

          <View style={{ marginTop: 10, marginBottom: 6 }}>
            <DayBars data={chartPoints} width={W - 40} height={88} />
          </View>

          <View style={styles.stats}>
            <Stat label="Average" value={stats.avg != null ? stats.avg.toFixed(1) : '–'} color={chartColor} />
            <Stat label="Positive run" value={streak > 0 ? `${streak}d` : '–'} color={chartColor} />
            <Stat label="Days logged" value={`${stats.logged}/${cfg.windowDays}`} color={chartColor} />
          </View>
        </AnimatedCard>

        {verdictReady ? (
          <AnimatedCard
            index={3}
            dial={dial}
            style={[styles.checkpoint, { backgroundColor: theme.colors.secondaryContainer, borderColor: theme.colors.secondary, borderRadius: radius }]}
          >
            <Text variant="labelSmall" style={[styles.eyebrow, { color: theme.colors.secondary }]}>
              ● Checkpoint
            </Text>
            <Text variant="titleMedium" style={styles.cpMsg}>
              {sliding.length
                ? `Your scores have drifted down — ${joinNames(sliding)} most of all. A real problem, or a rough patch?`
                : 'Your scores have drifted down. A real problem, or a rough patch?'}
            </Text>
            <PressableScale
              dial={dial}
              onPress={() => router.push('/verdict')}
              accessibilityLabel="Look together"
              style={[styles.cta, { backgroundColor: theme.colors.primary, borderRadius: radius }]}
            >
              <Text style={{ fontFamily: 'Roboto_500Medium', fontSize: 18, color: theme.colors.onPrimary }}>Look together</Text>
            </PressableScale>
          </AnimatedCard>
        ) : null}
      </ScrollView>

      <Fab dial={dial} onPress={() => router.push('/today')} label={hasToday ? undefined : 'Log today'} icon={hasToday ? 'check' : 'plus'} />
      <ReminderSheet visible={reminderOpen} onDismiss={() => setReminderOpen(false)} dial={dial} />
      <AboutSheet visible={aboutOpen} onDismiss={() => setAboutOpen(false)} dial={dial} />
      <PillarsSheet
        visible={pillarsOpen}
        onDismiss={() => setPillarsOpen(false)}
        onSaved={() => {
          setFilter(-1); // a stale pillar-index filter could silently point at a different pillar
          load();
        }}
        dial={dial}
      />
    </View>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  const theme = useTheme();
  // Filled tonal block in the chart's colour (M3 Expressive) — not cream + hairline.
  return (
    <View style={[styles.statCard, { backgroundColor: hexMix(theme.colors.surface, color, 0.14) }]}>
      <Text style={{ fontFamily: DISPLAY_FONT, fontSize: 28, color: theme.colors.onSurface }}>{value}</Text>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant, textTransform: 'uppercase', letterSpacing: 0.6, marginTop: 4 }}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 4 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  actions: { flexDirection: 'row', gap: 8 },
  iconBtn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  eyebrow: { textTransform: 'uppercase', letterSpacing: 1.6 },
  big: { fontFamily: DISPLAY_FONT, letterSpacing: -1, marginTop: 2 },
  hero: { alignItems: 'center', marginTop: 44, gap: 12 },
  chartSection: { marginTop: 40 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 10 },
  statCard: { flex: 1, borderRadius: 18, paddingVertical: 16, paddingHorizontal: 14 },
  checkpoint: { padding: 18, marginTop: 20, borderWidth: 1 },
  cpMsg: { marginTop: 10 },
  cta: { marginTop: 16, height: 52, alignItems: 'center', justifyContent: 'center' },
  learningLine: { marginTop: 8 },
  highlight: { textAlign: 'center', opacity: 0.9 },
});
