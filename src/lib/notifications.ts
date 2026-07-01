import * as Notifications from 'expo-notifications';

/**
 * One gentle daily reminder. No streaks / no guilt (docs/RESEARCH.md §1.4).
 * Safe to call anytime; it cancels and reschedules. No-ops if permission is denied.
 */
export async function ensureDailyReminder(time: string, enabled: boolean): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
  if (!enabled) return;

  const [hour, minute] = time.split(':').map((n) => Number(n));
  if (Number.isNaN(hour) || Number.isNaN(minute)) return;

  let granted = (await Notifications.getPermissionsAsync()).status === 'granted';
  if (!granted) granted = (await Notifications.requestPermissionsAsync()).status === 'granted';
  if (!granted) return;

  await Notifications.scheduleNotificationAsync({
    content: { title: '20days', body: 'How were your pillars today?' },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
    },
  });
}
