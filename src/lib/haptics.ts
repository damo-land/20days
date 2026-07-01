import * as Haptics from 'expo-haptics';

/**
 * The app's two haptic gestures (M3 Expressive: motion + touch answer the user's action).
 * `tick` for small selections (score taps, filter switches), `success` once on save.
 * Fire-and-forget — haptics must never block or throw (e.g. on simulators without an engine).
 */
export const haptics = {
  tick: () => {
    Haptics.selectionAsync().catch(() => {});
  },
  success: () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
  },
};
