import { format } from 'date-fns';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AnimatedCard } from '@/components/AnimatedCard';
import { BottomNav } from '@/components/BottomNav';
import { PillButton } from '@/components/PillButton';
import { Rule } from '@/components/Rule';
import { ScorePicker } from '@/components/ScorePicker';
import { TextLink } from '@/components/TextLink';
import { SCALE, SCALE_WORDS } from '@/config';
import { getEntriesForDate, listPillars, upsertEntry } from '@/db/repo';
import type { Pillar } from '@/db/schema';
import { todayISO } from '@/lib/date';
import { haptics } from '@/lib/haptics';
import { settings } from '@/settings/settings';
import { useAppStore } from '@/state/store';
import { TYPE } from '@/theme/brand';
import { useTones } from '@/theme/ThemeProvider';
import { DEFAULT_SCORE } from '@/theme/category';
import { expressiveness } from '@/theme/expressive';

export default function TodayScreen() {
  const date = todayISO();
  const t = useTones();
  const insets = useSafeAreaInsets();
  const trendState = useAppStore((s) => s.trendState);
  const startWipe = useAppStore((s) => s.startWipe);
  const [pillars, setPillars] = useState<Pillar[]>([]);
  const [scores, setScores] = useState<Record<number, number | null>>({});
  const [notes, setNotes] = useState<Record<number, string>>({});

  const load = useCallback(() => {
    const ps = listPillars();
    setPillars(ps);
    const existing = getEntriesForDate(date);
    const sMap: Record<number, number | null> = {};
    const nMap: Record<number, string> = {};
    ps.forEach((p) => {
      const e = existing.find((x) => x.pillarId === p.id);
      // Middle of the scale by default — the user just nudges from neutral.
      sMap[p.id] = e?.score ?? DEFAULT_SCORE;
      nMap[p.id] = e?.note ?? '';
    });
    setScores(sMap);
    setNotes(nMap);
  }, [date]);

  useFocusEffect(useCallback(() => load(), [load]));

  const todayVals = pillars.map((p) => scores[p.id]).filter((v): v is number => v != null);
  const todayComposite = todayVals.length ? todayVals.reduce((a, b) => a + b, 0) / todayVals.length : null;
  const dial = expressiveness(trendState, todayComposite, SCALE.min, SCALE.max);

  const save = () => {
    for (const p of pillars) {
      const v = scores[p.id];
      if (v != null) upsertEntry({ pillarId: p.id, date, score: v, note: notes[p.id]?.trim() || null, scaleVersion: SCALE.version });
    }
    haptics.success();
    // Monochrome wipe (a root overlay) — covers, navigates back to Trend, then reveals.
    startWipe([t.faint, t.ink]);
  };

  const skip = () => {
    settings.setTodayDismissed(date);
    router.back();
  };

  const hour = new Date().getHours();
  const eyebrow = `${format(new Date(), 'EEEE')} ${hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'}`;
  // The day is still going until the evening — the tense follows the clock.
  const headline = hour < 17 ? 'How is today going?' : 'How was today?';

  return (
    <View style={{ flex: 1, backgroundColor: t.paper }}>
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 18, paddingBottom: 140 }]}
        automaticallyAdjustKeyboardInsets
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
      >
        <AnimatedCard index={0} dial={dial}>
          <Text style={[TYPE.micro, { color: t.faded }]}>{eyebrow}</Text>
          {/* A question keeps its question mark — the stop is for statements (DESIGN.md §4). */}
          <Text style={[TYPE.display, styles.headline, { color: t.ink }]}>{headline}</Text>
          <Rule />
        </AnimatedCard>

        <View style={styles.list}>
          {/* The note's underline closes each block — no extra divider (one line, one job). */}
          {pillars.map((p, i) => (
            <AnimatedCard key={p.id} index={i + 1} dial={dial} style={styles.pillar}>
              <View style={styles.pillarHead}>
                <Text style={[TYPE.title, { color: t.ink }]} numberOfLines={1}>
                  {p.name}
                </Text>
                {/* The selection, said in a word — the picker stays wordless dots. */}
                <Text style={[TYPE.label, { color: t.faded }]}>
                  {scores[p.id] != null ? SCALE_WORDS[(scores[p.id] as number) - 1] : ''}
                </Text>
              </View>
              <ScorePicker value={scores[p.id] ?? null} onChange={(v) => setScores((s) => ({ ...s, [p.id]: v }))} />
              <TextInput
                value={notes[p.id] ?? ''}
                onChangeText={(txt) => setNotes((n) => ({ ...n, [p.id]: txt }))}
                placeholder="add a note…"
                placeholderTextColor={t.faded}
                style={[styles.note, { color: t.ink, borderBottomColor: t.hair }]}
                accessibilityLabel={`Note for ${p.name}`}
              />
            </AnimatedCard>
          ))}
        </View>

        <AnimatedCard index={pillars.length + 1} dial={dial}>
          <View style={styles.save}>
            <PillButton label="Save today" onPress={save} dial={dial} />
          </View>
          <View style={styles.skip}>
            <TextLink label="skip for today" onPress={skip} color={t.faded} size={14} align="center" />
          </View>
        </AnimatedCard>
      </ScrollView>

      <BottomNav
        activeKey="today"
        tabs={[
          { key: 'trend', label: 'trend', onPress: () => (router.canGoBack() ? router.back() : router.replace('/')) },
          { key: 'today', label: 'today', onPress: () => {} },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 24 },
  headline: { marginTop: 10 },
  list: { marginTop: 10 },
  pillar: { paddingTop: 22, paddingBottom: 10 },
  pillarHead: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between', gap: 12 },
  note: {
    marginTop: 12,
    fontFamily: 'FunnelSans_400Regular',
    fontSize: 14,
    lineHeight: 20,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  save: { marginTop: 26 },
  skip: { marginTop: 14, alignItems: 'center' },
});
