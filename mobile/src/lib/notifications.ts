import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Linking, Platform } from 'react-native';

// Allows notifications to appear even when the app is open.
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type NotificationPermissionState =
  | 'granted'
  | 'denied'
  | 'undetermined'
  | 'unavailable';

const NOTIFICATION_CHANNEL_ID = 'default';

// Shares the same permission request if multiple calls happen together.
let permissionRequest: Promise<boolean> | null = null;

// Android requires a notification channel before showing notifications.
async function createAndroidChannel() {
  if (Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: 'default',
    importance: Notifications.AndroidImportance.DEFAULT,
  });
}

async function requestNotificationPermission(): Promise<boolean> {
  // Skip notification requests when running in a simulator or emulator.
  if (!Device.isDevice) return false;

  await createAndroidChannel();

  // Check whether permission has already been granted.
  const { status: currentStatus } = await Notifications.getPermissionsAsync();
  if (currentStatus === 'granted') return true;

  // Ask the user for permission if it has not been granted yet.
  const { status: requestedStatus } =
    await Notifications.requestPermissionsAsync();

  return requestedStatus === 'granted';
}

/**
 * Requests notification permission without opening duplicate dialogs.
 *
 * Multiple calls share the same promise while a request is in progress.
 */
export function registerForNotificationsAsync(): Promise<boolean> {
  if (!permissionRequest) {
    permissionRequest = requestNotificationPermission().finally(() => {
      // Allow a new request after the current one finishes.
      permissionRequest = null;
    });
  }

  return permissionRequest;
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionState> {
  // Permission status is unavailable on simulators and emulators.
  if (!Device.isDevice) return 'unavailable';

  const { status } = await Notifications.getPermissionsAsync();

  if (status === 'granted') return 'granted';
  if (status === 'denied') return 'denied';

  return 'undetermined';
}

// Opens system settings so the user can change notification permissions.
export async function openSystemNotificationSettings(): Promise<void> {
  await Linking.openSettings();
}

/**
 * Schedules a local notification for the given date.
 *
 * Past dates are ignored, and the identifier allows an existing
 * scheduled notification with the same ID to be replaced.
 */
export async function scheduleReminder(
  id: string,
  title: string,
  body: string,
  triggerDate: Date
): Promise<void> {
  // Do not schedule reminders for dates that have already passed.
  if (triggerDate.getTime() <= Date.now()) return;

  const notificationsEnabled = await registerForNotificationsAsync();

  // Stop if notification permission is unavailable or denied.
  if (!notificationsEnabled) {
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

// Cancels a previously scheduled notification using its identifier.
export async function cancelReminder(id: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(id);
}