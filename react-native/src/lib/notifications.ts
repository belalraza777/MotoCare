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

// Asks once; safe to call repeatedly — no-ops if already granted/denied
export async function registerForNotificationsAsync(): Promise<boolean> {
  if (!Device.isDevice) return false; // simulators can't reliably receive local notifications

  const { status: existing } = await Notifications.getPermissionsAsync();
  let finalStatus = existing;

  if (existing !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  return finalStatus === 'granted';
}

// Schedules a one-time alert at a given date. Reusing the same id replaces
// any existing schedule for it, so calling this again is always safe.
export async function scheduleReminder(id: string, title: string, body: string, triggerDate: Date) {
  if (triggerDate.getTime() <= Date.now()) return; // skip past dates

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