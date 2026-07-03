import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { haptics } from '@/lib/haptics';
import { TYPE } from '@/theme/brand';
import { useTones } from '@/theme/ThemeProvider';
import { PRESET_PILLARS } from '@/theme/pillarMeta';

/**
 * Shared 3-pillar picker (onboarding + the pillars sheet). Full Stop chips: hairline outline
 * pills, ink fill when chosen — a pillar's face is its name, no icons, no identity colours
 * (docs/DESIGN.md §4). Three slot dots make the count visible (circle = a chosen thing).
 */
export function PillarPicker({
  selected,
  onChange,
  max = 3,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  const t = useTones();
  const [custom, setCustom] = useState('');

  const toggle = (name: string) => {
    const next = selected.includes(name) ? selected.filter((x) => x !== name) : selected.length < max ? [...selected, name] : selected;
    if (next !== selected) haptics.tick();
    onChange(next);
  };

  const addCustom = () => {
    const n = custom.trim();
    if (n && !selected.includes(n) && selected.length < max) {
      onChange([...selected, n]);
      setCustom('');
    }
  };

  const customPicks = selected.filter((s) => !PRESET_PILLARS.includes(s));

  const Chip = ({ name, disabled }: { name: string; disabled?: boolean }) => {
    const on = selected.includes(name);
    return (
      <Pressable
        onPress={() => toggle(name)}
        disabled={disabled}
        style={[
          styles.chip,
          on ? { backgroundColor: t.ink, borderColor: t.ink } : { borderColor: t.faint },
          { opacity: disabled ? 0.35 : 1 },
        ]}
        accessibilityRole="button"
        accessibilityState={{ selected: on, disabled }}
      >
        <Text style={[styles.chipLabel, { color: on ? t.paper : t.ink }]}>{name}</Text>
      </Pressable>
    );
  };

  return (
    <View>
      {/* Three slot dots that fill as pillars are chosen — the count, made visible. */}
      <View style={styles.slotsRow}>
        <View style={styles.slots}>
          {Array.from({ length: max }, (_, i) => (
            <View
              key={i}
              style={[
                styles.slot,
                selected[i] ? { backgroundColor: t.ink } : { borderWidth: 1.5, borderColor: t.faint },
              ]}
            />
          ))}
        </View>
        <Text style={[TYPE.label, { color: t.faded }]}>
          {selected.length} of {max} chosen
        </Text>
      </View>

      <View style={styles.chips}>
        {PRESET_PILLARS.map((name) => (
          <Chip key={name} name={name} disabled={!selected.includes(name) && selected.length >= max} />
        ))}
        {customPicks.map((name) => (
          <Chip key={name} name={name} />
        ))}
      </View>

      <TextInput
        value={custom}
        onChangeText={setCustom}
        onSubmitEditing={addCustom}
        returnKeyType="done"
        placeholder="add your own…"
        placeholderTextColor={t.faded}
        editable={selected.length < max}
        style={[styles.addField, { color: t.ink, borderBottomColor: t.hair, opacity: selected.length >= max ? 0.4 : 1 }]}
        accessibilityLabel="Add your own pillar"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slotsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 4, marginBottom: 14 },
  slots: { flexDirection: 'row', gap: 6 },
  slot: { width: 12, height: 12, borderRadius: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 9 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 11 },
  chipLabel: { fontFamily: 'FunnelSans_500Medium', fontSize: 14, lineHeight: 18 },
  addField: {
    marginTop: 18,
    fontFamily: 'FunnelSans_400Regular',
    fontSize: 16,
    lineHeight: 22,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
});
