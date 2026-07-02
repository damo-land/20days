import { format } from 'date-fns';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Text, TextInput, useTheme } from 'react-native-paper';
import { AnimatedCard } from '@/components/AnimatedCard';
import { Icon } from '@/components/Icon';
import { PressableScale } from '@/components/PressableScale';
import { ScoreBadge } from '@/components/ScoreBadge';
import { ScorePicker } from '@/components/ScorePicker';
import { SCALE } from '@/config';
import { getEntriesForDate, listPillars, upsertEntry } from '@/db/repo';
import type { Pillar } from '@/db/schema';
import { todayISO } from '@/lib/date';
import { haptics } from '@/lib/haptics';
import { settings } from '@/settings/settings';
import { useAppStore } from '@/state/store';
import { hexMix } from '@/theme/brand';
import { DEFAULT_SCORE, scoreColor } from '@/theme/category';
import { dialRadius, expressiveness, todayGreeting } from '@/theme/expressive';
import { DISPLAY_FONT } from '@/theme/fonts';
import { pillarIcon } from '@/theme/pillarMeta';

export default function TodayScreen() {
  const date = todayISO();
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const trendState = useAppStore((s) => s.trendState);
  const startWipe = useAppStore((s) => s.startWipe);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [scores, setScores] = useState<Record<number, number | null>>({});
  const [note, setNote] = useState('');

  const load = useCallback(() => {
    const ps = listPillars();
    setPillars(ps);
    const existing = getEntriesForDate(date);
    const map: Record<number, number | null> = {};
    ps.forEach((p) => {
      // Middle of the scale by default — the user just nudges from neutral.
      map[p.id] = existing.find((e) => e.pillarId === p.id)?.score ?? DEFAULT_SCORE;
    });
    setScores(map);
    setNote(existing.find((e) => e.note)?.note ?? '');
  }, [date]);

  useFocusEffect(useCallback(() => load(), [load]));

  const todayVals = pillars.map((p) => scores[p.id]).filter((v): v is number => v != null);
  const todayComposite = todayVals.length ? todayVals.reduce((a, b) => a + b, 0) / todayVals.length : null;
  const dial = expressiveness(trendState, todayComposite, SCALE.min, SCALE.max);
  const radius = Math.max(dialRadius(dial), 24);

  const save = () => {
    for (const p of pillars) {
      const v = scores[p.id];
      if (v != null) upsertEntry({ pillarId: p.id, date, score: v, note: note || null, scaleVersion: SCALE.version });
    }
    haptics.success();
    // Fire the wipe (a root overlay) — it covers, navigates back to Trend, then reveals.
    startWipe([scoreColor(scores[pillars[0]?.id] ?? null), scoreColor(scores[pillars[1]?.id] ?? null), theme.colors.primary]);
  };

  const skip = () => {
    settings.setTodayDismissed(date);
    router.back();
  };

  return (
    <ScrollView
      style={{ backgroundColor: theme.colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }]}
    >
      <AnimatedCard index={0} dial={dial}>
        <Text variant="labelMedium" style={[styles.date, { color: theme.colors.onSurfaceVariant }]}>
          {format(new Date(), 'EEEE · d MMMM')}
        </Text>
        <Text variant="displayMedium" style={[styles.big, { color: theme.colors.onSurface }]}>
          Today
        </Text>
        <Text variant="bodyMedium" style={styles.sub}>
          {todayGreeting(dial, new Date().getHours())}
        </Text>
      </AnimatedCard>

      <View style={styles.list}>
        {pillars.map((p, i) => {
          const c = scoreColor(scores[p.id] ?? null);
          return (
            <AnimatedCard key={p.id} index={i + 1} dial={dial} style={[styles.card, { backgroundColor: hexMix(theme.colors.surface, c, 0.16), borderRadius: radius }]}>
              <View style={styles.cardHead}>
                <View style={styles.nameRow}>
                  <Icon name={pillarIcon(p.name)} size={18} color={theme.colors.onSurfaceVariant} />
                  <Text variant="titleLarge" style={styles.pillarName}>
                    {p.name}
                  </Text>
                </View>
                <ScoreBadge value={scores[p.id] ?? null} color={c} surface={theme.colors.surface} size={48} />
              </View>
              <ScorePicker value={scores[p.id] ?? null} onChange={(v) => setScores((s) => ({ ...s, [p.id]: v }))} color={c} />
            </AnimatedCard>
          );
        })}
      </View>

      <AnimatedCard index={pillars.length + 1} dial={dial}>
        <TextInput
          mode="outlined"
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          multiline
          style={styles.note}
          outlineStyle={styles.noteOutline}
        />
        <PressableScale
          dial={dial}
          onPress={save}
          accessibilityLabel="Submit"
          style={[styles.save, { borderRadius: radius, backgroundColor: theme.colors.primary }]}
        >
          <Text style={[styles.cta, { color: theme.colors.onPrimary }]}>Save today</Text>
        </PressableScale>
        <Button mode="text" onPress={skip} textColor={theme.colors.onSurfaceVariant} style={styles.skipBtn} labelStyle={styles.skipLabel}>
          Skip for today
        </Button>
      </AnimatedCard>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, gap: 4 },
  skipBtn: { marginTop: 6, alignSelf: 'center' },
  date: { textTransform: 'uppercase', letterSpacing: 1.4 },
  big: { fontFamily: DISPLAY_FONT, marginTop: 2, letterSpacing: -1 },
  sub: { opacity: 0.75, marginTop: 8 },
  list: { marginTop: 12, gap: 12 },
  card: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 16 },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  nameRow: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9 },
  pillarName: { flexShrink: 1 },
  note: { marginTop: 14, backgroundColor: 'transparent' },
  noteOutline: { borderRadius: 18 },
  save: { marginTop: 16, height: 54, alignItems: 'center', justifyContent: 'center' },
  cta: { fontFamily: 'Roboto_500Medium', fontSize: 18, letterSpacing: 0.2 },
  skipLabel: { fontSize: 15 },
});
