import { useCallback, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiClient } from '../../../../api/client';
import { Service } from '../../../../types/service.types';
import { LoadingView, ErrorView } from '../../../../components/ui/StateViews';
import { Button } from '../../../../components/ui/Button';
import { useTheme } from '../../../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../../../constants/theme';

export default function ServiceDetailScreen() {
  const { id: bikeId, serviceId } = useLocalSearchParams<{ id: string; serviceId: string }>();
  const api = useApiClient();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setService(await api.services.getOne(bikeId, serviceId));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load service visit');
    } finally {
      setLoading(false);
    }
  }, [api, bikeId, serviceId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleDelete = () => {
    Alert.alert('Delete Service Visit', 'This removes the visit and all its linked maintenance items.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.services.delete(bikeId, serviceId);
            router.back();
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message ?? 'Failed to delete');
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingView />;
  if (error || !service) return <ErrorView message={error ?? 'Not found'} onRetry={load} />;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{service.workshop || 'Service Visit'}</Text>
        <Text style={styles.date}>{new Date(service.date).toLocaleDateString()} • {service.odometer.toLocaleString()} km</Text>

        <View style={styles.itemsCard}>
          {service.maintenanceIds.map((m) => (
            <View key={m._id} style={styles.itemRow}>
              <Text style={styles.itemType}>{m.type.replace(/_/g, ' ')}</Text>
              <Text style={styles.itemCost}>₹{m.cost}</Text>
            </View>
          ))}
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>₹{service.totalCost}</Text>
          </View>
        </View>

        {service.notes ? <Text style={styles.notes}>{service.notes}</Text> : null}

        <View style={{ marginTop: Spacing.xl }}>
          <Button label="Delete Visit" onPress={handleDelete} variant="danger" loading={deleting} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    container: { padding: Spacing.lg },
    title: { fontSize: Typography.size.xl, fontWeight: Typography.weight.bold, color: colors.text },
    date: { fontSize: Typography.size.sm, color: colors.textMuted, marginTop: Spacing.xs },

    itemsCard: {
      backgroundColor: colors.card,
      borderRadius: Radius.md,
      padding: Spacing.md,
      marginTop: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: Spacing.xs + 2 },
    itemType: { fontSize: Typography.size.sm, color: colors.text, textTransform: 'capitalize' },
    itemCost: { fontSize: Typography.size.sm, color: colors.textSecondary },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: Spacing.sm,
      paddingTop: Spacing.sm,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    totalLabel: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: colors.text },
    totalValue: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: colors.primary },

    notes: { fontSize: Typography.size.sm, color: colors.textSecondary, marginTop: Spacing.lg },
  });
}