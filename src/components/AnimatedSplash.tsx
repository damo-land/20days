import { type ReactNode, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { INK_LIGHT, PAPER_LIGHT } from '@/theme/brand';
import { Wordmark } from './Wordmark';

/**
 * Branded loading screen: the wordmark (Paper on Ink, blue stop) — the splash is always
 * ink-side regardless of mode. Matches the native splash so the handoff is seamless, springs
 * the wordmark in, then fades over the app once `ready`. RN Animated (no worklet dep).
 */
export function AnimatedSplash({ ready, children }: { ready: boolean; children: ReactNode }) {
  const [hidden, setHidden] = useState(false);
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.92)).current;

  useEffect(() => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 7, tension: 60 }).start();
  }, [scale]);

  useEffect(() => {
    if (!ready) return;
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 450, delay: 220, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1.04, duration: 450, delay: 220, useNativeDriver: true }),
    ]).start(({ finished }) => finished && setHidden(true));
  }, [ready, opacity, scale]);

  return (
    <View style={styles.root}>
      {ready ? children : null}
      {hidden ? null : (
        <Animated.View
          style={[StyleSheet.absoluteFill, styles.overlay, { opacity }]}
          onLayout={() => SplashScreen.hideAsync().catch(() => {})}
          pointerEvents={ready ? 'none' : 'auto'}
        >
          <Animated.View style={{ transform: [{ scale }] }}>
            <Wordmark size={56} color={PAPER_LIGHT} />
          </Animated.View>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  overlay: { backgroundColor: INK_LIGHT, alignItems: 'center', justifyContent: 'center' },
});
