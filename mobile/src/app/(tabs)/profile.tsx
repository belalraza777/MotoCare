import { useCallback, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Switch, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { LinearGradient } from 'expo-linear-gradient';
import { Moon, Sun, Pencil, Check, X, LogOut, Bike, Sparkles } from 'lucide-react-native';
import { useApiClient } from '../../api/client';
import { Avatar } from '../../components/ui/Avatar';
import { AppFooter } from '../../components/ui/AppFooter';
import { NotificationSettings } from '../../components/ui/NotificationSettings';
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

  useFocusEffect(
    useCallback(() => {
      loadBikeCount();
    }, [loadBikeCount])
  );

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
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.screenTitle}>Profile</Text>

        <LinearGradient
          colors={[colors.primary, colors.primary + 'CC']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileHero}
        >
        <Sparkles size={18} color="rgba(255,255,255,0.7)" style={styles.heroSparkle} />
        <View style={styles.avatarRing}>
          <Avatar imageUrl={user?.imageUrl} name={user?.fullName} size={76} />
        </View>

        {!editing ? (
          <View style={styles.heroNameRow}>
            <Text style={styles.heroName}>{displayName}</Text>
            <TouchableOpacity style={styles.editIconBtn} onPress={startEdit}>
              <Pencil size={14} color="#fff" strokeWidth={2.4} />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.editForm}>
            <TextInput
              style={styles.heroInput}
              placeholder="First name"
              placeholderTextColor="rgba(255,255,255,0.65)"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.heroInput}
              placeholder="Last name (optional)"
              placeholderTextColor="rgba(255,255,255,0.65)"
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

        <Text style={styles.heroEmail}>{user?.primaryEmailAddress?.emailAddress}</Text>
        <View style={styles.memberPill}>
          <Bike size={13} color="#fff" strokeWidth={2.2} />
          <Text style={styles.memberText}>MotoCare rider</Text>
        </View>
        </LinearGradient>

        <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <View style={[styles.statIcon, { backgroundColor: colors.primarySoft }]}>
            <Bike size={18} color={colors.primary} strokeWidth={2.2} />
          </View>
          <Text style={styles.statValue}>{bikeCount ?? '—'}</Text>
          <Text style={styles.statLabel}>Bikes in Garage</Text>
        </View>
        <View style={styles.statBox}>
          <View style={[styles.statIcon, { backgroundColor: colors.info + '18' }]}>
            {isDark ? <Moon color={colors.info} size={18} strokeWidth={2.2} /> : <Sun color={colors.info} size={18} strokeWidth={2.2} />}
          </View>
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

        <NotificationSettings />

        <TouchableOpacity style={styles.signOutRow} onPress={() => signOut()}>
          <LogOut size={18} color={colors.error} strokeWidth={2.2} />
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>

        <AppFooter />
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { flexGrow: 1, padding: Spacing.lg, paddingBottom: Spacing.xl },
    screenTitle: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: colors.text, marginBottom: Spacing.lg },
    profileHero: {
      borderRadius: Radius.xl,
      alignItems: 'center',
      padding: Spacing.xl,
      overflow: 'hidden',
      marginBottom: Spacing.lg,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 5,
    },
    heroSparkle: { position: 'absolute', top: Spacing.lg, right: Spacing.lg },
    avatarRing: {
      padding: 4,
      borderRadius: 44,
      backgroundColor: 'rgba(255,255,255,0.24)',
      marginBottom: Spacing.sm,
    },

    heroNameRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, marginTop: Spacing.sm },
    heroName: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: '#fff' },
    editIconBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    heroEmail: { fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.78)', marginTop: Spacing.xs },
    memberPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      marginTop: Spacing.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.xs,
      borderRadius: Radius.xl,
      backgroundColor: 'rgba(255,255,255,0.16)',
    },
    memberText: { fontSize: Typography.size.xs, color: '#fff', fontWeight: Typography.weight.medium },

    editForm: { width: '100%', marginTop: Spacing.md, gap: Spacing.sm },
    heroInput: {
      borderWidth: 1,
      borderColor: 'rgba(255,255,255,0.35)',
      borderRadius: Radius.sm,
      padding: Spacing.md,
      color: '#fff',
      backgroundColor: 'rgba(255,255,255,0.12)',
      fontSize: Typography.size.md,
    },
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
    statIcon: {
      width: 34,
      height: 34,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.sm,
    },
    statValue: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: colors.text },
    statLabel: { fontSize: Typography.size.xs + 1, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
    themeSwitch: { marginTop: Spacing.xs },
    signOutRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: Spacing.sm,
      marginTop: Spacing.md,
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