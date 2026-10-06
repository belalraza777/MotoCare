import { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { Moon, Sun, Pencil, Check, X, LogOut } from 'lucide-react-native';
import { useApiClient } from '../../api/client';
import { Avatar } from '../../components/ui/Avatar';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const api = useApiClient();
  const { colors, isDark, toggleTheme } = useTheme();
  const styles = createStyles(colors);

  const [bikeCount, setBikeCount] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [saving, setSaving] = useState(false);

  // quick stat — just the count, not the full bike list, so this stays light
  const loadBikeCount = useCallback(async () => {
    try {
      const bikes = await api.bikes.getAll();
      setBikeCount(bikes.length);
    } catch {
      setBikeCount(null); // nice-to-have stat, fails silently
    }
  }, [api]);

  useFocusEffect(useCallback(() => { loadBikeCount(); }, [loadBikeCount]));

  const startEdit = () => {
    setFirstName(user?.firstName ?? '');
    setLastName(user?.lastName ?? '');
    setEditing(true);
  };

  const cancelEdit = () => setEditing(false);

  const saveName = async () => {
    if (!firstName.trim()) {
      Alert.alert('Name required', 'First name cannot be empty.');
      return;
    }
    setSaving(true);
    try {
      await user?.update({ firstName: firstName.trim(), lastName: lastName.trim() || undefined });
      setEditing(false);
    } catch (err: any) {
      Alert.alert('Error', err.errors?.[0]?.message ?? 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress?.split('@')[0] || 'Rider';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Avatar imageUrl={user?.imageUrl} name={user?.fullName} size={72} />

        {!editing ? (
          <View style={styles.nameRow}>
            <Text style={styles.name}>{displayName}</Text>
            <TouchableOpacity style={styles.editIconBtn} onPress={startEdit}>
              <Pencil size={14} color={colors.primary} strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editForm}>
            <TextInput
              style={styles.input}
              placeholder="First name"
              placeholderTextColor={colors.textMuted}
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.input}
              placeholder="Last name (optional)"
              placeholderTextColor={colors.textMuted}
              value={lastName}
              onChangeText={setLastName}
            />
            <View style={styles.editActions}>
              <TouchableOpacity style={[styles.editActionBtn, styles.cancelBtn]} onPress={cancelEdit} disabled={saving}>
                <X size={16} color={colors.textSecondary} strokeWidth={2.4} />
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.editActionBtn, styles.saveBtn]} onPress={saveName} disabled={saving}>
                <Check size={16} color="#fff" strokeWidth={2.4} />
                <Text style={styles.saveText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        <Text style={styles.email}>{user?.primaryEmailAddress?.emailAddress}</Text>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{bikeCount ?? '—'}</Text>
          <Text style={styles.statLabel}>Bikes in Garage</Text>
        </View>
        <View style={styles.statBox}>
          {isDark ? <Moon color={colors.primary} size={24} strokeWidth={2.2} /> : <Sun color={colors.primary} size={24} strokeWidth={2.2} />}
          <Text style={styles.statLabel}>{isDark ? 'Dark Mode' : 'Light Mode'}</Text>
          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{ false: colors.border, true: colors.primarySoft }}
            thumbColor={isDark ? colors.primary : colors.surface}
            ios_backgroundColor={colors.border}
            style={styles.themeSwitch}
          />
        </View>
      </View>

      <TouchableOpacity style={styles.signOutRow} onPress={() => signOut()}>
        <LogOut size={18} color={colors.error} strokeWidth={2.2} />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, padding: Spacing.lg },
    header: { alignItems: 'center', marginTop: Spacing.xl, marginBottom: Spacing.xl },

    nameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.md },
    name: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: colors.text },
    editIconBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },

    email: { fontSize: Typography.size.sm, color: colors.textMuted, marginTop: Spacing.xs },

    editForm: { width: '100%', marginTop: Spacing.md, gap: Spacing.sm },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      padding: Spacing.md,
      color: colors.text,
      backgroundColor: colors.surface,
      fontSize: Typography.size.md,
    },
    editActions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
    editActionBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: Spacing.sm + 2,
      borderRadius: Radius.sm,
    },
    cancelBtn: { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
    cancelText: { color: colors.textSecondary, fontWeight: Typography.weight.semibold, fontSize: Typography.size.sm },
    saveBtn: { backgroundColor: colors.primary },
    saveText: { color: '#fff', fontWeight: Typography.weight.semibold, fontSize: Typography.size.sm },

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
    themeSwitch: { marginTop: Spacing.xs },

    signOutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      marginTop: 'auto',
      marginBottom: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: Radius.sm,
      borderWidth: 1,
      borderColor: colors.error + '40',
      backgroundColor: colors.error + '10',
    },
    signOutText: { color: colors.error, fontWeight: Typography.weight.semibold, fontSize: Typography.size.md },
  });
}