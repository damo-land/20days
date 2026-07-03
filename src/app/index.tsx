import { format } from 'date-fns';
import { Redirect, router, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AboutSheet } from '@/components/AboutSheet';
import { AnimatedCard } from '@/components/AnimatedCard';
import { BottomNav } from '@/components/BottomNav';
import { DayDots } from '@/components/DayDots';
import { MenuSheet } from '@/components/MenuSheet';
import { PillarsSheet } from '@/components/PillarsSheet';
import { PillButton } from '@/components/PillButton';
import { ReminderSheet } from '@/components/ReminderSheet';
import { Rule } from '@/components/Rule';
import { Stop } from '@/components/Stop';
import { VerdictSheet } from '@/components/VerdictSheet';
import { SCALE } from '@/config';
import { getEntriesForDate, getPillarScoreRowsSince, listPillars } from '@/db/repo';
import { isoDaysAgo, todayISO } from '@/lib/date';
import { settings } from '@/settings/settings';
import { hexMix, NUMBER_FONT, STATE_BLOCKS, TYPE } from '@/theme/brand';
import { useTones } from '@/theme/ThemeProvider';
import { useAppStore } from '@/state/store';
import { DEFAULT_TREND_CONFIG, type DayPoint, type TrendState } from '@/trend/engine';
import { buildPillarTrends, joinNames, decliningPillars, type PillarTrend } from '@/trend/pillars';
import { refreshTrend } from '@/trend/refresh';
import { buildDailySeries } from '@/trend/series';

const NEUTRAL_SCORE = (SCALE.min + SCALE.max) / 2; // scale midpoint — matches the trend engine's neutral fill

/**
 * The screen's one sentence — the headline IS the reading (docs/DESIGN.md §1). When the
 * trend-triggered checkpoint is live (declining + confident + past cooldown), it takes the
 * headline over: one message per screen, never a repeat below.
 */
function headlineFor(state: TrendState, confident: boolean, checkpoint: boolean): string {
  if (checkpoint) return 'Worth a look';
  if (!confident) return 'Still coming into focus';
  switch (state) {
    case 'improving':
      return 'Quietly improving';
    case 'declining':
      return 'Drifting down';
    default:
      return 'Holding steady';
  }
}

/** The pillar row's trend word — lowercase, faded, plain ink (never colour-coded). */
const TREND_WORD: Record<TrendState, string> = {
  improving: 'rising',
  stable: 'steady',
  declining: 'sliding',
  insufficient: 'settling in',
};

function statsOf(points: DayPoint[], neutral: number) {
  // Average treats unlogged days as neutral (an "unknown = neutral" prior, matching the trend
  // engine); the logged count stays the real number of days scored.
  const logged = points.filter((p) => p.value != null).length;
  const avg = points.length ? points.reduce((a, p) => a + (p.value ?? neutral), 0) / points.length : null;
  return { avg, logged };
}

export default function TrendHome() {
  const cfg = DEFAULT_TREND_CONFIG;
  const t = useTones();
  const insets = useSafeAreaInsets();
  const { width: W } = useWindowDimensions();
  const [series, setSeries] = useState<DayPoint[]>([]);
  const [trends, setTrends] = useState<PillarTrend[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [verdictOpen, setVerdictOpen] = useState(false);
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
    const pillars = listPillars();
    setTrends(buildPillarTrends(rows, pillars, cfg.windowDays, date));
    refreshTrend();

    if (!gateRan.current) {
      gateRan.current = true;
      if (settings.isOnboarded() && pillars.length > 0 && !loggedToday && !settings.isTodayDismissed(date)) router.push('/today');
    }
  }, [cfg.windowDays]);

  useFocusEffect(load);

  const stats = statsOf(series, NEUTRAL_SCORE);
  const sliding = decliningPillars(trends);

  // One Modal can't swap for another in the same tick — close the menu, then open after a beat.
  const fromMenu = (open: () => void) => {
    setMenuOpen(false);
    setTimeout(open, 300);
  };

  // Redirect covers the desync case too: onboarded flag set but no pillars in the DB.
  if (!settings.isOnboarded() || listPillars().length === 0) return <Redirect href="/onboarding" />;

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <ScrollView contentContainerStyle={[styles.container, { paddingTop: insets.top + 18, paddingBottom: 140 }]}>
        <AnimatedCard index={0} dial={dial}>
          <View style={styles.topRow}>
            <Text style={[TYPE.micro, { color: t.faded }]}>{format(new Date(), 'EEEE d MMMM')}</Text>
            <Pressable onPress={() => setMenuOpen(true)} accessibilityRole="button" accessibilityLabel="Menu" hitSlop={12}>
              <Text style={[styles.menuDots, { color: t.ink }]}>···</Text>
            </Pressable>
          </View>
          <Text style={[TYPE.display, styles.headline, { color: t.ink }]}>
            {headlineFor(trendState, confident, verdictReady)}
            <Stop size={TYPE.display.fontSize} />
          </Text>
          <Rule />
        </AnimatedCard>

        {verdictReady ? (
          <AnimatedCard index={1} dial={dial} style={styles.checkpoint}>
            <Text style={[TYPE.body, { color: t.faded }]}>
              {sliding.length
                ? `${joinNames(sliding)} ${sliding.length > 1 ? 'have' : 'has'} been drifting down for a while. A real problem, or a rough patch? Your own numbers and notes, side by side.`
                : 'Your scores have been drifting down for a while. A real problem, or a rough patch? Your own numbers and notes, side by side.'}
            </Text>
            <View style={{ marginTop: 16 }}>
              <PillButton label="See what's sliding" onPress={() => setVerdictOpen(true)} dial={dial} />
            </View>
          </AnimatedCard>
        ) : null}

        <AnimatedCard index={verdictReady ? 2 : 1} dial={dial} style={styles.pillars}>
          <Text style={[TYPE.micro, { color: t.faded, marginBottom: 10 }]}>Pillars · latest score &amp; last 7 days</Text>
          <View style={styles.blocks}>
            {trends.map((p) => (
              <PillarBlock key={p.pillarId} p={p} />
            ))}
          </View>
        </AnimatedCard>

        <AnimatedCard index={verdictReady ? 3 : 2} dial={dial} style={styles.chart}>
          <Text style={[TYPE.title, { color: t.ink }]}>The bigger picture</Text>
          <Text style={[TYPE.label, { color: t.faded, marginTop: 2, marginBottom: 16 }]}>
            Every day from all three pillars, the last {cfg.windowDays} days
          </Text>
          <DayDots data={series} width={W - 48} height={96} />
          <View style={styles.statBand}>
            <View style={styles.statCell}>
              <Text style={[styles.statNum, { color: t.ink }]}>{stats.avg != null ? stats.avg.toFixed(1) : '–'}</Text>
              <Text style={[TYPE.micro, { color: t.faded, marginTop: 4 }]}>Average</Text>
            </View>
            <View style={[styles.statCell, styles.statCellDivided, { borderLeftColor: t.hair }]}>
              <Text style={[styles.statNum, { color: t.ink }]}>
                {stats.logged}
                <Text style={[styles.statNumSmall, { color: t.faded }]}> /{cfg.windowDays}</Text>
              </Text>
              <Text style={[TYPE.micro, { color: t.faded, marginTop: 4 }]}>Days logged</Text>
            </View>
          </View>
          {!confident ? (
            <Text style={[TYPE.body, { color: t.faded, marginTop: 14 }]}>
              Keep checking in. Your trend comes into focus with more days.
            </Text>
          ) : null}
        </AnimatedCard>
      </ScrollView>

      <BottomNav
        activeKey="trend"
        tabs={[
          { key: 'trend', label: 'trend', onPress: () => {} },
          { key: 'today', label: 'today', onPress: () => router.push('/today') },
        ]}
      />
      <MenuSheet
        visible={menuOpen}
        onDismiss={() => setMenuOpen(false)}
        items={[
          { label: 'Edit pillars', onPress: () => fromMenu(() => setPillarsOpen(true)) },
          { label: 'Daily reminder', onPress: () => fromMenu(() => setReminderOpen(true)) },
          { label: 'About 20days', onPress: () => fromMenu(() => setAboutOpen(true)) },
        ]}
      />
      <ReminderSheet visible={reminderOpen} onDismiss={() => setReminderOpen(false)} dial={dial} />
      <AboutSheet visible={aboutOpen} onDismiss={() => setAboutOpen(false)} dial={dial} />
      <PillarsSheet visible={pillarsOpen} onDismiss={() => setPillarsOpen(false)} onSaved={load} dial={dial} />
      <VerdictSheet
        visible={verdictOpen}
        onDismiss={() => {
          setVerdictOpen(false);
          load(); // a door may have recorded a verdict — refresh the checkpoint state
        }}
        dial={dial}
      />
    </View>
  );
}

/**
 * A pillar's state block (user-requested): soft hue wash when the pillar is MOVING
 * (mint = rising, coral = sliding), neutral paper wash when steady — colour keeps meaning.
 * Everything on a wash is tone-on-tone: deep-hue trend word, number and today-dot.
 */
function PillarBlock({ p }: { p: PillarTrend }) {
  const t = useTones();
  const moving = p.state === 'improving' || p.state === 'declining';
  const block = moving ? STATE_BLOCKS[p.state as 'improving' | 'declining'][t.dark ? 'dark' : 'light'] : null;
  const latest = [...p.points].reverse().find((x) => x.value != null)?.value ?? null;
  return (
    <View style={[styles.block, { backgroundColor: block?.wash ?? hexMix(t.paper, t.ink, 0.045) }]}>
      <View style={styles.blockName}>
        <Text style={[TYPE.title, { color: t.ink }]} numberOfLines={1}>
          {p.name}
        </Text>
        <Text style={[TYPE.label, { color: block?.deep ?? t.faded, marginTop: 2 }]}>{TREND_WORD[p.state]}</Text>
      </View>
      <DayDots
        data={p.points.slice(-7)}
        width={100}
        height={38}
        tint={block ? { fill: block.dot, faint: block.faint, today: block.deep } : undefined}
      />
      <Text style={[styles.blockNum, { color: block?.deep ?? t.ink }]}>{latest ?? '–'}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24 },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  menuDots: { fontFamily: 'FunnelDisplay_600SemiBold', fontSize: 22, lineHeight: 22, letterSpacing: 1 },
  headline: { marginTop: 10 },
  checkpoint: { marginTop: 18 },
  chart: { marginTop: 34 },
  statBand: { flexDirection: 'row', marginTop: 22 },
  statCell: { flex: 1 },
  statCellDivided: { borderLeftWidth: 1, paddingLeft: 24 },
  statNum: { fontFamily: NUMBER_FONT, fontSize: 30, lineHeight: 34, fontVariant: ['tabular-nums'] },
  statNumSmall: { fontFamily: NUMBER_FONT, fontSize: 18 },
  pillars: { marginTop: 26 },
  blocks: { gap: 10 },
  block: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: 16, borderRadius: 16 },
  blockName: { flex: 1, paddingRight: 4 },
  blockNum: { fontFamily: NUMBER_FONT, fontSize: 30, lineHeight: 34, fontVariant: ['tabular-nums'], minWidth: 24, textAlign: 'right' },
});
