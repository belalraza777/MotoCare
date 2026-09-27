import { useCallback, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useApiClient } from '../../api/client';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const api = useApiClient();
  const { colors, isDark } = useTheme();
  const styles = createStyles(colors);

  const [bikeCount, setBikeCount] = useState<number | null>(null);

  // Quick stat — just the count, not the full bike list, so this stays light
  const loadBikeCount = useCallback(async () => {
    try {
      const bikes = await api.bikes.getAll();
      setBikeCount(bikes.length);
    } catch {
      setBikeCount(null); // fails silently — this is a nice-to-have stat, not critical
    }
  }, [api]);

  useFocusEffect(useCallback(() => { loadBikeCount(); }, [loadBikeCount]));

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Rider';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>

      <View style={styles.header}>
        <Avatar imageUrl={user?.imageUrl} name={user?.fullName} size={72} />
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{bikeCount ?? '—'}</Text>
          <Text style={styles.statLabel}>Bikes in Garage</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{isDark ? '🌙' : '☀️'}</Text>
          <Text style={styles.statLabel}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
        </View>
      </View>

      <View style={styles.signOutWrap}>
        <Button label="Sign Out" onPress={() => signOut()} variant="danger" />
      </View>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: Spacing.lg },
    header: { alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.xl },
    name: {
      fontSize: Typography.size.xl,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginTop: Spacing.md,
    },
    email: {
      fontSize: Typography.size.sm,
      color: colors.textMuted,
      marginTop: 2,
    },

    statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
    statBox: {
      flex: 1,
      backgroundColor: colors.card,
      borderRadius: Radius.md,
      padding: Spacing.md,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValue: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: colors.text },
    statLabel: { fontSize: Typography.size.xs + 1, color: colors.textMuted, marginTop: 4, textAlign: 'center' },

    signOutWrap: { marginTop: 'auto', marginBottom: Spacing.lg },
  });
}