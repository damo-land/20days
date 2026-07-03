import { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { haptics } from '@/lib/haptics';
import { useReduceMotion } from '@/lib/useReduceMotion';
import { TYPE } from '@/theme/brand';
import { useTones } from '@/theme/ThemeProvider';
import { motionTokens } from '@/theme/expressive';

export interface MenuItem {
  label: string;
  onPress: () => void;
}

/**
 * The ··· menu (play lives in the punctuation — an ellipsis, not a burger). A small slide-up
 * sheet of editorial rows for the screen's secondary destinations. Tapping a row dismisses
 * first; the parent opens the follow-up sheet after a beat (two Modals can't swap same-tick).
 */
export function MenuSheet({ visible, onDismiss, items }: { visible: boolean; onDismiss: () => void; items: MenuItem[] }) {
  const t = useTones();
  const insets = useSafeAreaInsets();
  const reduce = useReduceMotion();
  const y = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    y.setValue(0);
    const { spatialDefault } = motionTokens(0.5, reduce);
    Animated.spring(y, { toValue: 1, useNativeDriver: true, ...spatialDefault }).start();
  }, [visible, reduce, y]);

  const translateY = y.interpolate({ inputRange: [0, 1], outputRange: [360, 0] });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onDismiss} statusBarTranslucent>
      <Animated.View style={[styles.backdrop, { opacity: y }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss} accessibilityLabel="Close menu" />
      </Animated.View>
      <Animated.View
        style={[styles.sheet, { backgroundColor: t.paper, paddingBottom: insets.bottom + 16, transform: [{ translateY }] }]}
      >
        <View style={[styles.handle, { backgroundColor: t.faint }]} />
        {items.map((item, i) => (
          <Pressable
            key={item.label}
            onPress={() => {
              haptics.tick();
              item.onPress();
            }}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            style={[styles.row, i > 0 && { borderTopWidth: 1, borderTopColor: t.hair }]}
          >
            <Text style={[TYPE.title, { color: t.ink }]}>{item.label}</Text>
          </Pressable>
        ))}
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(10,10,9,0.45)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 24,
    paddingTop: 12,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  handle: { alignSelf: 'center', width: 40, height: 5, borderRadius: 3, marginBottom: 6, opacity: 0.7 },
  row: { paddingVertical: 18 },
});
