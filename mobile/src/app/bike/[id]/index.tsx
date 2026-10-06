import { useCallback, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Pencil,
  Wrench,
  Settings,
  Fuel,
  FileText,
  ChevronRight,
} from 'lucide-react-native';
import { useApiClient } from '../../../api/client';
import { BikeDashboard } from '../../../types/dashboard.types';
import { LoadingView, ErrorView } from '../../../components/ui/StateViews';
import { Button } from '../../../components/ui/Button';
import { ServiceStatusBadge } from '../../../components/ui/ServiceStatusBadge';
import { StatusBadge } from '../../../components/ui/StatusBadge';
import { useTheme } from '../../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../../constants/theme';
import { scheduleBikeReminders } from '../../../lib/reminderScheduler';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

export default function BikeDashboardScreen() {
  const { id: bikeId } = useLocalSearchParams<{ id: string }>();
  const api = useApiClient();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [dashboard, setDashboard] = useState<BikeDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // reminders should only be scheduled once per real data change, not on
  // every focus — track the last bikeId we scheduled for
  const lastScheduledFor = useRef<string | null>(null);

  // Load dashboard data
  const load = useCallback(async (isRefresh = false) => {
    setError(null);

    if (isRefresh) setRefreshing(true);

    try {
      const data = await api.dashboard.get(bikeId);
      setDashboard(data);

      if (lastScheduledFor.current !== bikeId) {
        scheduleBikeReminders(data);
        lastScheduledFor.current = bikeId;
      }
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load dashboard');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api, bikeId]); //this dependency array ensures that the load function is recreated whenever the api or bikeId changes, which is important for keeping the function up-to-date with the latest values.

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  // Pull-to-refresh handler
  const onPullToRefresh = useCallback(() => {
    load(true);
  }, [load]);

  // Delete bike handler
  const handleDelete = () => {
    Alert.alert(
      'Delete Bike',
      'This will permanently delete this bike and all its records.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);

            try {
              await api.bikes.delete(bikeId);
              router.replace('/(tabs)/garage');
            } catch (err: any) {
              Alert.alert(
                'Error',
                err.response?.data?.message ?? 'Failed to delete bike'
              );
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  // Render loading, error, or dashboard view
  if (loading) return <LoadingView />;
  if (error || !dashboard) return <ErrorView message={error ?? 'Not found'} onRetry={() => load()} />;

  // Destructure dashboard data for easier access
  const { bike, serviceDue, expenses, documents } = dashboard;


  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onPullToRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bikeName}>{bike.brand} {bike.model}</Text>
            {bike.variant ? <Text style={styles.bikeVariant}>{bike.variant}</Text> : null}
            {bike.registrationNumber ? <Text style={styles.regNumber}>{bike.registrationNumber}</Text> : null}
          </View>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => router.push({ pathname: '/bike/[id]/edit', params: { id: bikeId } })}
            activeOpacity={0.7}
          >
            <Pencil size={14} color={colors.primary} strokeWidth={2.4} />
            <Text style={styles.editLink}>Edit</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.serviceBanner}>
          <View style={styles.serviceBannerTop}>
            <Text style={styles.serviceBannerLabel}>Next Service</Text>
            <ServiceStatusBadge status={serviceDue.status} />
          </View>
          <Text style={styles.serviceRemaining}>
            {serviceDue.status === 'overdue'
              ? `${(bike.currentKm - serviceDue.nextDueKm).toLocaleString()} km overdue`
              : `${serviceDue.remainingKm.toLocaleString()} km remaining`}
          </Text>
          <Text style={styles.serviceDueKm}>
            Due at {serviceDue.nextDueKm.toLocaleString()} km
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{bike.currentKm.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Current KM</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>₹{expenses.thisMonth.toLocaleString()}</Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>₹{expenses.total.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Total Spend</Text>
          </View>
        </View>

        {documents.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Documents</Text>
            <View style={styles.docsCard}>
              {documents.map((doc) => (
                <View key={doc._id} style={styles.docRow}>
                  <View style={styles.documentInfo}>
                    <Text style={styles.docLabel}>
                      {doc.type === 'OTHER' ? doc.title : doc.type}
                    </Text>
                    <Text style={styles.documentExpiry}>
                      {doc.status === 'expired'
                        ? `Expired ${formatDate(doc.expiryDate)}`
                        : `Expires ${formatDate(doc.expiryDate)}`}
                    </Text>
                  </View>
                  <StatusBadge status={doc.status} />
                </View>
              ))}
            </View>
          </>
        )}

        <Text style={styles.sectionTitle}>Manage</Text>

        <NavRow icon={<Wrench size={18} color={colors.primary} strokeWidth={2.2} />} label="Maintenance" onPress={() => router.push({ pathname: '/bike/[id]/maintenance', params: { id: bikeId } })} colors={colors} />
        <NavRow icon={<Settings size={18} color={colors.primary} strokeWidth={2.2} />} label="Service" onPress={() => router.push({ pathname: '/bike/[id]/service', params: { id: bikeId } })} colors={colors} />
        <NavRow icon={<Fuel size={18} color={colors.primary} strokeWidth={2.2} />} label="Fuel" onPress={() => router.push({ pathname: '/bike/[id]/fuel', params: { id: bikeId } })} colors={colors} />
        <NavRow icon={<FileText size={18} color={colors.primary} strokeWidth={2.2} />} label="Documents" onPress={() => router.push({ pathname: '/bike/[id]/documents', params: { id: bikeId } })} colors={colors} />

        <View style={{ marginTop: Spacing.xl }}>
          <Button label="Delete Bike" onPress={handleDelete} variant="danger" loading={deleting} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function NavRow({
  icon,
  label,
  onPress,
  colors,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  colors: ThemeColors;
}) {
  const styles = createStyles(colors);
  return (
    <TouchableOpacity style={styles.navRow} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.navRowLeft}>
        <View style={styles.navIconWrap}>{icon}</View>
        <Text style={styles.navRowText}>{label}</Text>
      </View>
      <ChevronRight size={18} color={colors.textMuted} strokeWidth={2.2} />
    </TouchableOpacity>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.lg, paddingBottom: 40 },

    headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.lg },
    bikeName: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: colors.text, letterSpacing: -0.3 },
    bikeVariant: { fontSize: Typography.size.md, color: colors.textSecondary, marginTop: 2 },
    regNumber: { fontSize: Typography.size.sm, color: colors.textMuted, marginTop: 4, letterSpacing: 0.5 },
    editButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: Spacing.sm + 2,
      paddingVertical: 6,
      borderRadius: Radius.sm,
      backgroundColor: colors.primarySoft,
    },
    editLink: { color: colors.primary, fontWeight: Typography.weight.semibold, fontSize: Typography.size.sm },

    serviceBanner: {
      backgroundColor: colors.primarySoft,
      borderRadius: Radius.md,
      padding: Spacing.lg,
      marginBottom: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.primarySoft,
    },
    serviceBannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    serviceBannerLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, color: colors.primary, letterSpacing: 0.3 },
    serviceRemaining: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: colors.text, marginTop: Spacing.xs },
    serviceDueKm: { fontSize: Typography.size.xs + 1, color: colors.textSecondary, marginTop: 2 },

    statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
    statBox: { flex: 1, backgroundColor: colors.card, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: colors.border },
    statValue: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: colors.text },
    statLabel: { fontSize: Typography.size.xs, color: colors.textMuted, marginTop: 2, letterSpacing: 0.3 },

    sectionTitle: { fontSize: Typography.size.md, fontWeight: Typography.weight.semibold, color: colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },

    docsCard: { backgroundColor: colors.card, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: colors.border },
    docRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.xs + 2 },
    documentInfo: { flex: 1 },
    docLabel: { fontSize: Typography.size.sm, color: colors.text, textTransform: 'capitalize' },
    documentExpiry: { fontSize: Typography.size.xs, color: colors.textMuted, marginTop: 2 },

    navRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: Radius.md,
      padding: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
    },
    navRowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm + 2 },
    navIconWrap: {
      width: 34,
      height: 34,
      borderRadius: Radius.sm,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    navRowText: { fontSize: Typography.size.md, color: colors.text, fontWeight: Typography.weight.medium },
  });
}