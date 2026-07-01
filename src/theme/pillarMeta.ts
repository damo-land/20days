import type { IconName } from '@/components/Icon';

/**
 * Pillar identity — a friendly icon + its own colour per preset life area. The icon follows the
 * pillar everywhere it appears (picker, check-in card, ring legend) so "your three" have faces;
 * the identity colour is used only in the picker — everywhere else colour stays semantic (score).
 */
export const PRESET_META: Record<string, { icon: IconName; color: string }> = {
  Health: { icon: 'heart', color: '#E0785C' },
  Fitness: { icon: 'activity', color: '#2FA08F' },
  Sleep: { icon: 'moon', color: '#5B6CB0' },
  Work: { icon: 'briefcase', color: '#4A6FA5' },
  Money: { icon: 'dollar', color: '#E0A32E' },
  Relationships: { icon: 'heart', color: '#B5657A' },
  Family: { icon: 'home', color: '#5FA98C' },
  Friends: { icon: 'users', color: '#6E7FC2' },
  Learning: { icon: 'book', color: '#D98859' },
  Creativity: { icon: 'star', color: '#C77DAE' },
  Mindfulness: { icon: 'leaf', color: '#3E7C63' },
  Fun: { icon: 'smile', color: '#E6B22E' },
};

export const PRESET_PILLARS = Object.keys(PRESET_META);
export const CUSTOM_COLOR = '#6E7FC2';

/** Icon for any pillar name — custom pillars get the star. */
export function pillarIcon(name: string): IconName {
  return PRESET_META[name]?.icon ?? 'star';
}
