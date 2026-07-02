import type { IconName } from '@/components/Icon';

/**
 * Pillar identity — a friendly icon + its own colour per preset life area. The icon follows the
 * pillar everywhere it appears (picker, check-in card, ring legend) so "your three" have faces;
 * the identity colour is used only in the picker — everywhere else colour stays semantic (score).
 */
export const PRESET_META: Record<string, { icon: IconName; color: string }> = {
  Health: { icon: 'heart', color: '#E85D3D' },
  Fitness: { icon: 'activity', color: '#16A085' },
  Sleep: { icon: 'moon', color: '#4B5BD6' },
  Work: { icon: 'briefcase', color: '#2E6FD6' },
  Money: { icon: 'dollar', color: '#F0A81E' },
  Relationships: { icon: 'heart', color: '#C84E6E' },
  Family: { icon: 'home', color: '#34A87A' },
  Friends: { icon: 'users', color: '#5A6EE0' },
  Learning: { icon: 'book', color: '#E5772E' },
  Creativity: { icon: 'star', color: '#C85FA8' },
  Mindfulness: { icon: 'leaf', color: '#1F8A63' },
  Fun: { icon: 'smile', color: '#F0BE1E' },
};

export const PRESET_PILLARS = Object.keys(PRESET_META);
export const CUSTOM_COLOR = '#5A6EE0';

/** Icon for any pillar name — custom pillars get the star. */
export function pillarIcon(name: string): IconName {
  return PRESET_META[name]?.icon ?? 'star';
}
