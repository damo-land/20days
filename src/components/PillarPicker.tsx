import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Text, TextInput, useTheme } from 'react-native-paper';
import { haptics } from '@/lib/haptics';
import { hexMix, onColorFor } from '@/theme/brand';
import { CUSTOM_COLOR, PRESET_META, PRESET_PILLARS } from '@/theme/pillarMeta';
import { Icon, type IconName } from './Icon';

/** Shared 3-pillar chip picker (onboarding + the pillars editor). Controlled by the parent. */
export function PillarPicker({
  selected,
  onChange,
  max = 3,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
  max?: number;
}) {
  const theme = useTheme();
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

  const customPicks = selected.filter((s) => !PRESET_META[s]);

  const Chip = ({ name, icon, color, disabled }: { name: string; icon: IconName; color: string; disabled?: boolean }) => {
    const on = selected.includes(name);
    const bg = on ? color : hexMix(theme.colors.surface, color, 0.14);
    const fg = on ? onColorFor(color) : theme.colors.onSurface;
    return (
      <Pressable
        onPress={() => toggle(name)}
        disabled={disabled}
        style={[styles.chip, { backgroundColor: bg, opacity: disabled ? 0.4 : 1 }]}
        accessibilityRole="button"
        accessibilityState={{ selected: on, disabled }}
      >
        <Icon name={icon} size={17} color={on ? fg : color} strokeWidth={2.2} />
        <Text style={{ color: fg, fontSize: 14, fontFamily: on ? 'Roboto_500Medium' : 'Roboto_400Regular' }}>{name}</Text>
      </Pressable>
    );
  };

  return (
    <View>
      {/* Three slots that fill with the chosen pillars' own colours — the count, made visible. */}
      <View style={styles.slotsRow}>
        <View style={styles.slots}>
          {Array.from({ length: max }, (_, i) => {
            const color = selected[i] ? PRESET_META[selected[i]]?.color ?? CUSTOM_COLOR : null;
            return (
              <View
                key={i}
                style={[
                  styles.slot,
                  color ? { backgroundColor: color } : { borderWidth: 2, borderColor: theme.colors.outlineVariant },
                ]}
              />
            );
          })}
        </View>
        <Text variant="titleMedium" style={styles.counter}>
          {selected.length} of {max} chosen
        </Text>
      </View>

      <View style={styles.chips}>
        {PRESET_PILLARS.map((name) => (
          <Chip key={name} name={name} icon={PRESET_META[name].icon} color={PRESET_META[name].color} disabled={!selected.includes(name) && selected.length >= max} />
        ))}
        {customPicks.map((name) => (
          <Chip key={name} name={name} icon="star" color={CUSTOM_COLOR} />
        ))}
      </View>

      <TextInput
        mode="outlined"
        label="Add your own"
        value={custom}
        onChangeText={setCustom}
        onSubmitEditing={addCustom}
        returnKeyType="done"
        style={[styles.addField, { backgroundColor: 'transparent' }]}
        contentStyle={styles.addContent}
        outlineStyle={styles.addOutline}
        disabled={selected.length >= max}
        right={
          custom.trim() && selected.length < max ? (
            <TextInput.Icon
              icon={() => <Icon name="plus" size={22} color={theme.colors.primary} strokeWidth={2.4} />}
              onPress={addCustom}
              forceTextInputFocus={false}
              accessibilityLabel="Add pillar"
              style={styles.addIcon}
            />
          ) : undefined
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  slotsRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8, marginBottom: 12 },
  slots: { flexDirection: 'row', gap: 6 },
  slot: { width: 16, height: 16, borderRadius: 8 },
  counter: { opacity: 0.9 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 15, paddingVertical: 11, borderRadius: 22 },
  addField: { marginTop: 16, height: 60 },
  addContent: { alignSelf: 'center' },
  addIcon: { marginTop: 6 },
  addOutline: { borderRadius: 16 },
});
