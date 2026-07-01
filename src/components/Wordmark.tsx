import { StyleSheet, Text } from 'react-native';
import { BRAND } from '@/theme/brand';

/**
 * The 20days wordmark (Brand Guidelines §03): text-only, Bricolage SemiBold, tracked in
 * to −3.5%, lowercase. No icon — the word does the work. Renders without the Paper theme so
 * it is safe to use on the splash (before the provider mounts).
 */
export function Wordmark({ size = 44, color = BRAND.ink }: { size?: number; color?: string }) {
  return (
    <Text style={[styles.mark, { fontSize: size, lineHeight: size * 1.02, letterSpacing: size * -0.035, color }]}>
      20days
    </Text>
  );
}

const styles = StyleSheet.create({ mark: { fontFamily: 'BricolageGrotesque_600SemiBold' } });
