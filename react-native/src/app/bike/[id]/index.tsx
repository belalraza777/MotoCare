import { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClient } from '../../../api/client';
import { Bike } from '../../../types/bike.types';
import { LoadingView, ErrorView } from '../../../components/ui/StateViews';
import { Button } from '../../../components/ui/Button';
import { useTheme } from '../../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function BikeDashboardScreen() {
  const { id: bikeId } = useLocalSearchParams<{ id: string }>();
  const api = useApiClient();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [bike, setBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setBike(await api.bikes.getOne(bikeId));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load bike');
    } finally {
      setLoading(false);
    }
  }, [api, bikeId]);

  // Refetch on every focus — picks up currentKm changes made from
  // Maintenance/Service/Fuel screens without a manual refresh
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = () => {
    Alert.alert('Delete Bike', 'This will permanently delete this bike and cannot be undone.', [
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
            Alert.alert('Error', err.response?.data?.message ?? 'Failed to delete bike');
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingView />;
  if (error || !bike) return <ErrorView message={error ?? 'Bike not found'} onRetry={load} />;

  // Flat estimate using the bike's own interval — will switch to using the
  // last Service's odometer as the baseline once the Service model exists
  const nextServiceDueKm = bike.currentKm + bike.serviceIntervalKm;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
      >
        <View style={styles.headerRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.bikeName}>{bike.brand} {bike.model}</Text>
            {bike.variant ? <Text style={styles.bikeVariant}>{bike.variant}</Text> : null}
            {bike.registrationNumber ? <Text style={styles.regNumber}>{bike.registrationNumber}</Text> : null}
          </View>
        </View>

        <View style={styles.serviceBanner}>
          <Text style={styles.serviceBannerLabel}>Next Service</Text>
          <Text style={styles.serviceBannerValue}>Due at {nextServiceDueKm.toLocaleString()} km</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{bike.currentKm.toLocaleString()}</Text>
            <Text style={styles.statLabel}>Current KM</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{bike.fuelType}</Text>
            <Text style={styles.statLabel}>Fuel Type</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Manage</Text>

        <TouchableOpacity
          style={styles.navRow}
          onPress={() => router.push({ pathname: '/bike/[id]/service', params: { id: bikeId } })}
        >
          <Text style={styles.navRowText}>🛠️  Service</Text>
          <Text style={styles.navRowArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navRow}
          onPress={() => router.push({ pathname: '/bike/[id]/maintenance', params: { id: bikeId } })}
        >
          <Text style={styles.navRowText}>🔧  Maintenance</Text>
          <Text style={styles.navRowArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navRow}
          onPress={() => router.push({ pathname: '/bike/[id]/fuel', params: { id: bikeId } })}
        >
          <Text style={styles.navRowText}>⛽  Fuel</Text>
          <Text style={styles.navRowArrow}>›</Text>
        </TouchableOpacity>

        <View style={[styles.navRow, styles.navRowDisabled]}>
          <Text style={styles.navRowTextDisabled}>📄  Documents (coming soon)</Text>
        </View>

        <View style={styles.actions}>
          <Button
            label="Edit Bike"
            onPress={() =>
              router.push({
                pathname: '/bike/[id]/edit',
                params: { id: bikeId },
              })
            }
          />

          <Button
            label="Delete Bike"
            onPress={handleDelete}
            variant="danger"
            loading={deleting}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: Spacing.lg, paddingBottom: Spacing.xl * 2 },

    headerRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: Spacing.lg },
    bikeName: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: colors.text },
    bikeVariant: { fontSize: Typography.size.md, color: colors.textSecondary, marginTop: 2 },
    regNumber: { fontSize: Typography.size.sm, color: colors.textMuted, marginTop: 4 },
    editLink: { color: colors.primary, fontWeight: Typography.weight.semibold, fontSize: Typography.size.sm },

    serviceBanner: { backgroundColor: colors.primarySoft, borderRadius: Radius.md, padding: Spacing.lg, marginBottom: Spacing.lg },
    serviceBannerLabel: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, color: colors.primary },
    serviceBannerValue: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: colors.text, marginTop: 2 },

    statsRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.xl },
    statBox: { flex: 1, backgroundColor: colors.card, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: colors.border },
    statValue: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: colors.text },
    statLabel: { fontSize: Typography.size.xs + 1, color: colors.textMuted, marginTop: 2 },

    sectionTitle: { fontSize: Typography.size.md, fontWeight: Typography.weight.semibold, color: colors.text, marginBottom: Spacing.sm },
    navRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: colors.card, borderRadius: Radius.md, padding: Spacing.md + 2, marginBottom: Spacing.sm, borderWidth: 1, borderColor: colors.border },
    navRowText: { fontSize: Typography.size.md, color: colors.text, fontWeight: Typography.weight.medium },
    navRowArrow: { fontSize: Typography.size.lg, color: colors.textMuted },
    navRowDisabled: { opacity: 0.5 },
    navRowTextDisabled: { fontSize: Typography.size.md, color: colors.textMuted },
    actions: {
      marginTop: Spacing.xl,
      gap: Spacing.sm,
    },
  });
}