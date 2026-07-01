import Storage from 'expo-sqlite/kv-store';

/**
 * Small key-value settings, backed by expo-sqlite's kv-store (works in Expo Go; no MMKV
 * dev build needed for the scaffold). Sync API keeps call sites simple.
 */
const K = {
  onboarded: 'onboarded',
  reminderTime: 'reminderTime',
  reminderOn: 'reminderOn',
  lastVerdictAt: 'lastVerdictAt',
  todayDismissed: 'todayDismissed', // ISO date the user skipped the check-in (so we don't nag)
} as const;

export const settings = {
  isOnboarded: () => Storage.getItemSync(K.onboarded) === '1',
  setOnboarded: (v: boolean) => Storage.setItemSync(K.onboarded, v ? '1' : '0'),

  getReminderTime: () => Storage.getItemSync(K.reminderTime) ?? '20:00',
  setReminderTime: (t: string) => Storage.setItemSync(K.reminderTime, t),

  isReminderOn: () => (Storage.getItemSync(K.reminderOn) ?? '1') === '1',
  setReminderOn: (v: boolean) => Storage.setItemSync(K.reminderOn, v ? '1' : '0'),

  getLastVerdictAt: (): number | null => {
    const v = Storage.getItemSync(K.lastVerdictAt);
    return v ? Number(v) : null;
  },
  setLastVerdictAt: (ms: number) => Storage.setItemSync(K.lastVerdictAt, String(ms)),

  /** Per-day "skipped the check-in" flag — so a skipped Today doesn't reappear until tomorrow. */
  isTodayDismissed: (dateISO: string) => Storage.getItemSync(K.todayDismissed) === dateISO,
  setTodayDismissed: (dateISO: string) => Storage.setItemSync(K.todayDismissed, dateISO),
};
