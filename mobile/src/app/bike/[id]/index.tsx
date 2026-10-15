import { useCallback, useRef, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
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
import { UpdateKmModal } from '../../../components/Bike/UpdateKmModal';
import { DeleteBikeModal } from '../../../components/Bike/DeleteBikeModal';
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
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [kmModalOpen, setKmModalOpen] = useState(false);
  const [kmSaving, setKmSaving] = useState(false);
  const [kmError, setKmError] = useState<string | null>(null);

  // Reminders should only be scheduled once per real data change, not on
  // every focus.
  const lastScheduledFor = useRef<string | null>(null);

  // Load dashboard data
  const load = useCallback(async (isRefresh = false) => {
    setError(null);

    if (isRefresh) setRefreshing(true);

    try {
      const data = await api.dashboard.get(bikeId);
      setDashboard(data);

      const reminderKey = [
        bikeId,
        data.documents
          .map((document) => `${document._id}:${document.expiryDate}:${document.status}`)
          .join(','),
        data.serviceDue.status,
        data.serviceDue.remainingKm,
        data.serviceDue.nextDueKm,
      ].join('|');

      if (lastScheduledFor.current !== reminderKey) {
        scheduleBikeReminders(data)
          .then(() => {
            lastScheduledFor.current = reminderKey;
          })
          .catch((notificationError) => {
            console.error('Failed to schedule bike reminders', notificationError);
          });
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

  // Update KM handlers
  const saveKm = async (km: number) => {
    setKmSaving(true);
    setKmError(null);
    try {
      await api.bikes.update(bikeId, { currentKm: km });
      setKmModalOpen(false);
      await load();
    } catch (err: any) {
      setKmError(err.response?.data?.message ?? 'Failed to update KM');
    } finally {
      setKmSaving(false);
    }
  };

  // Delete bike handler
  const confirmDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    try {
      await api.bikes.delete(bikeId);
      setDeleteOpen(false);
      router.replace('/(tabs)/garage');
    } catch (err: any) {
      setDeleteError(err.response?.data?.message ?? 'Failed to delete bike');
      setDeleting(false);
    }
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
          <View style={styles.headerInfo}>
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
          <TouchableOpacity
            style={styles.statBox}
            activeOpacity={0.7}
            onPress={() => {
              setKmError(null);
              setKmModalOpen(true);
            }}
          >
            <View style={styles.statValueRow}>
              <Text
                style={styles.currentKmValue}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.7}
              >
                {bike.currentKm.toLocaleString()} <Text style={styles.currentKmUnit}>KM</Text>
              </Text>
            </View>
            <Text style={styles.statLabel}>Current KM</Text>
            <View style={styles.statActionRow}>
              <Text style={styles.statAction} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
                Tap to update
              </Text>
              <Pencil size={11} color={colors.primary} strokeWidth={2.4} />
            </View>
          </TouchableOpacity>
          <View style={styles.statBox}>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              ₹{expenses.thisMonth.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>This Month</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              ₹{expenses.total.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>Total Spend</Text>
          </View>
        </View>

        {documents.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Documents</Text>
            <View style={styles.docsCard}>
              {documents.map((doc, index) => (
                <View key={doc._id} style={[styles.docRow, index < documents.length - 1 && styles.docRowBorder]}>
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

        <View style={styles.deleteSection}>
          <Button
            label="Delete Bike"
            onPress={() => {
              setDeleteError(null);
              setDeleteOpen(true);
            }}
            variant="danger"
          />
        </View>
      </ScrollView>
      <UpdateKmModal
        visible={kmModalOpen}
        currentKm={bike.currentKm}
        loading={kmSaving}
        serverError={kmError}
        onClose={() => setKmModalOpen(false)}
        onSubmit={saveKm}
      />
      <DeleteBikeModal
        visible={deleteOpen}
        bikeName={`${bike.brand} ${bike.model}`}
        loading={deleting}
        error={deleteError}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
      />
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
    content: { padding: Spacing.lg, paddingTop: Spacing.md, paddingBottom: 56 },

    headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.xl },
    headerInfo: { flex: 1, paddingRight: Spacing.md },
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
      borderColor: colors.primary,
      borderLeftWidth: 4,
    },
    serviceBannerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    serviceBannerLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, color: colors.primary, letterSpacing: 0.3 },
    serviceRemaining: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: colors.text, marginTop: Spacing.xs },
    serviceDueKm: { fontSize: Typography.size.xs + 1, color: colors.textSecondary, marginTop: 2 },

    statsRow: { flexDirection: 'row', gap: Spacing.sm, marginBottom: Spacing.xl },
    statBox: {
      flex: 1,
      minHeight: 88,
      justifyContent: 'center',
      backgroundColor: colors.card,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.sm,
      paddingVertical: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    statValueRow: { alignItems: 'center' },
    currentKmValue: {
      maxWidth: '100%',
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      textAlign: 'center',
      flexShrink: 1,
    },
    currentKmUnit: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold, color: colors.textSecondary },
    statValue: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: colors.text, textAlign: 'center' },
    statLabel: { fontSize: Typography.size.xs, color: colors.textMuted, marginTop: 4, letterSpacing: 0.2, textAlign: 'center' },
    statActionRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 3,
      marginTop: Spacing.xs,
    },
    statAction: {
      flexShrink: 1,
      fontSize: Typography.size.xs,
      color: colors.primary,
      fontWeight: Typography.weight.semibold,
    },

    sectionTitle: { fontSize: Typography.size.md, fontWeight: Typography.weight.semibold, color: colors.text, marginBottom: Spacing.sm, marginTop: Spacing.sm },

    docsCard: { backgroundColor: colors.card, borderRadius: Radius.md, padding: Spacing.md, marginBottom: Spacing.lg, borderWidth: 1, borderColor: colors.border },
    docRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: Spacing.sm },
    docRowBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
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
    deleteSection: { marginTop: Spacing.xl },
  });
}