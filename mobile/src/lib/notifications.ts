import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';

// Show alerts even while the app is open, not just backgrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let registrationPromise: Promise<boolean> | null = null;

async function registerNotifications(): Promise<boolean> {
  if (!Device.isDevice) return false; // simulators can't reliably receive local notifications

  // Android requires a channel before its notification permission prompt can
  // be shown on Android 13 and later.
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  return finalStatus === 'granted';
}

// Asks once; safe to call repeatedly — no-ops if already granted/denied.
// Sharing the in-flight promise also prevents scheduling from racing the
// permission request during the initial app render.
export function registerForNotificationsAsync(): Promise<boolean> {
  if (!registrationPromise) {
    registrationPromise = registerNotifications();
    registrationPromise.catch(() => {
      registrationPromise = null;
    });
  }

  return registrationPromise;
}

// Schedules a one-time alert at a given date. Reusing the same id replaces
// any existing schedule for it, so calling this again is always safe.
export async function scheduleReminder(
  id: string,
  title: string,
  body: string,
  triggerDate: Date
) {
  if (triggerDate.getTime() <= Date.now()) return; // skip past dates

  if (!(await registerForNotificationsAsync())) {
    console.warn('Notifications are not enabled; skipping reminder:', id);
    return;
  }

  await Notifications.scheduleNotificationAsync({
    identifier: id,
    content: { title, body },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
    },
  });
}

// Cancels a scheduled alert by id. No-op if no such alert exists.
export async function cancelReminder(id: string) {
  await Notifications.cancelScheduledNotificationAsync(id);
}