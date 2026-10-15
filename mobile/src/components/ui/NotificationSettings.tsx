import { useCallback, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { AlertCircle, CheckCircle2, Settings } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, ThemeColors, Typography } from '../../constants/theme';
import {
  getNotificationPermissionStatus,
  NotificationPermissionState,
  openSystemNotificationSettings,
  registerForNotificationsAsync,
} from '../../lib/notifications';

function getStatusText(status: NotificationPermissionState) {
  if (status === 'granted') return 'Enabled';
  if (status === 'denied') return 'Blocked. Allow it in system settings.';
  if (status === 'unavailable') return 'Not available on a simulator.';
  return 'Not enabled yet.';
}

function getButtonText(status: NotificationPermissionState) {
  if (status === 'undetermined') return 'Enable notifications';
  if (status === 'unavailable') return 'Unavailable';
  return 'Open system settings';
}

export function NotificationSettings() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [status, setStatus] = useState<NotificationPermissionState>('undetermined');
  const [loading, setLoading] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      setStatus(await getNotificationPermissionStatus());
    } catch (error) {
      console.error('Failed to load notification permission status', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadStatus();
    }, [loadStatus])
  );

  const handlePress = async () => {
    if (status === 'unavailable') return;

    setLoading(true);
    try {
      if (status === 'undetermined') {
        const enabled = await registerForNotificationsAsync();
        if (!enabled) {
          Alert.alert(
            'Notifications are off',
            'You can allow notifications from system settings.'
          );
        }
      } else {
        await openSystemNotificationSettings();
      }
      await loadStatus();
    } catch (error) {
      console.error('Failed to update notification permission', error);
      Alert.alert('Error', 'Could not update notification settings.');
    } finally {
      setLoading(false);
    }
  };

  const isEnabled = status === 'granted';
  const isUnavailable = status === 'unavailable';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.icon}>
          {isEnabled ? (
            <CheckCircle2 color={colors.success} size={16} strokeWidth={2.4} />
          ) : (
            <AlertCircle color={colors.warning} size={16} strokeWidth={2.4} />
          )}
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Notifications</Text>
          <Text style={styles.subtitle}>{getStatusText(status)}</Text>
        </View>
      </View>

      <TouchableOpacity
        style={[styles.button, isUnavailable && styles.disabled]}
        onPress={handlePress}
        disabled={loading || isUnavailable}
        activeOpacity={0.7}
      >
        <Settings color={colors.primary} size={16} strokeWidth={2.2} />
        <Text style={styles.buttonText}>
          {loading ? 'Please wait...' : getButtonText(status)}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderColor: colors.border,
      borderRadius: Radius.md,
      borderWidth: 1,
      marginBottom: Spacing.md,
      padding: Spacing.md,
    },
    header: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: Spacing.sm,
      marginBottom: Spacing.sm,
    },
    icon: {
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderColor: colors.border,
      borderRadius: 15,
      borderWidth: 1,
      height: 30,
      justifyContent: 'center',
      width: 30,
    },
    textContainer: { flex: 1 },
    title: {
      color: colors.text,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semibold,
    },
    subtitle: {
      color: colors.textSecondary,
      fontSize: Typography.size.sm,
      marginTop: 2,
    },
    button: {
      alignItems: 'center',
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary + '55',
      borderRadius: Radius.sm,
      borderWidth: 1,
      flexDirection: 'row',
      gap: Spacing.xs + 2,
      justifyContent: 'center',
      paddingVertical: Spacing.sm + 2,
    },
    disabled: { opacity: 0.6 },
    buttonText: {
      color: colors.primary,
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
    },
  });
}
