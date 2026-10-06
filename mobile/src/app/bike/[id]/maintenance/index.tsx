import { useCallback, useState } from 'react';
import { FlatList, Text, StyleSheet } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClient } from '../../../../api/client';
import { Maintenance } from '../../../../types/maintenance.types';
import { MaintenanceCard } from '../../../../components/Maintenance/MaintenanceCard';
import { LoadingView, ErrorView, EmptyView } from '../../../../components/ui/StateViews';
import { Fab } from '../../../../components/ui/Fab';
import { useTheme } from '../../../../context/ThemeContext';
import { Spacing, Typography, ThemeColors } from '../../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function MaintenanceListScreen() {
  const { id: bikeId } = useLocalSearchParams<{ id: string }>();
  const api = useApiClient();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [records, setRecords] = useState<Maintenance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRecords(await api.maintenance.getAll(bikeId));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load maintenance records');
    } finally {
      setLoading(false);
    }
  }, [api, bikeId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Text style={styles.heading}>
        Maintenance Records
      </Text>

      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<EmptyView title="No maintenance records yet" />}
        renderItem={({ item }) => (
          <MaintenanceCard
            item={item}
            onPress={() =>
              router.push({
                pathname: '/bike/[id]/maintenance/[maintenanceId]/edit',
                params: { id: bikeId, maintenanceId: item._id },
              })
            }
          />
        )}
      />
      <Fab onPress={() => router.push({ pathname: '/bike/[id]/maintenance/add', params: { id: bikeId } })} bottomOffset={60} />
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  heading: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: colors.text, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  listContent: { padding: Spacing.lg, paddingTop: Spacing.sm, flexGrow: 1 },
  });
}