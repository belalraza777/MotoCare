import { useCallback, useState } from 'react';
import {  FlatList,Text } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClient } from '../../../../api/client';
import { Maintenance } from '../../../../types/maintenance.types';
import { MaintenanceCard } from '../../../../components/Maintenance/MaintenanceCard';
import { LoadingView, ErrorView, EmptyView } from '../../../../components/ui/StateViews';
import { Fab } from '../../../../components/ui/Fab';
import { useTheme } from '../../../../context/ThemeContext';
import { Spacing } from '../../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function MaintenanceListScreen() {
  const { id: bikeId } = useLocalSearchParams<{ id: string }>();
  const api = useApiClient();
  const router = useRouter();
  const { colors } = useTheme();

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
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: Spacing.md, paddingHorizontal: Spacing.lg }}>
        Maintenance Records
      </Text>

      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: Spacing.lg, flexGrow: 1 }}
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