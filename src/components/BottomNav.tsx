import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptics } from '@/lib/haptics';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { useTones } from '@/theme/ThemeProvider';

export interface NavTab {
  key: string;
  label: string;
  onPress: () => void;
}

const DOT = 6;

/**
 * The nav (docs/DESIGN.md §8): two lowercase words and the travelling dot — one Prime Blue
 * circle that slides under the active word (the Travel verb). Paper surface, hairline top,
 * no icons, no pill.
 */
export function BottomNav({ tabs, activeKey }: { tabs: NavTab[]; activeKey: string }) {
  const t = useTones();
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const [centers, setCenters] = useState<Record<string, number>>({});
  const x = useRef(new Animated.Value(0)).current;
  const placed = useRef(false);
  const cx = centers[activeKey];

  useEffect(() => {
    if (cx == null) return;
    const to = cx - DOT / 2;
    if (!placed.current || reduce) {
      x.setValue(to);
      placed.current = true;
      return;
    }
    Animated.spring(x, { toValue: to, useNativeDriver: true, stiffness: 300, damping: 22, mass: 1 }).start();
  }, [cx, reduce, x]);

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 14), backgroundColor: t.paper, borderTopColor: t.hair }]}>
      <View style={styles.rowWrap}>
        <View style={styles.row}>
          {tabs.map((tab) => {
            const active = tab.key === activeKey;
            return (
              <Pressable
                key={tab.key}
                onPress={() => {
                  if (!active) {
                    haptics.tick();
                    tab.onPress();
                  }
                }}
                onLayout={(e) => {
                  const { x: lx, width } = e.nativeEvent.layout;
                  const c = lx + width / 2;
                  setCenters((prev) => (prev[tab.key] === c ? prev : { ...prev, [tab.key]: c }));
                }}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                accessibilityLabel={tab.label}
                style={styles.tab}
              >
                <Text style={[styles.label, { color: active ? t.ink : t.faded }]}>{tab.label}</Text>
              </Pressable>
            );
          })}
        </View>
        {cx != null ? (
          <Animated.View style={[styles.dot, { backgroundColor: t.blue, transform: [{ translateX: x }] }]} />
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: 1, paddingTop: 10 },
  rowWrap: { alignSelf: 'center' },
  row: { flexDirection: 'row', gap: 44 },
  tab: { paddingHorizontal: 6, paddingVertical: 4 },
  label: { fontFamily: 'FunnelSans_500Medium', fontSize: 15, lineHeight: 20 },
  dot: { position: 'absolute', left: 0, bottom: -4, width: DOT, height: DOT, borderRadius: DOT / 2 },
});
