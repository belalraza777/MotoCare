import { useCallback, useState } from 'react';
import { View, FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClient } from '../../../../api/client';
import { Service } from '../../../../types/service.types';
import { ServiceCard } from '../../../../components/Service/ServiceCard';
import { LoadingView, ErrorView, EmptyView } from '../../../../components/ui/StateViews';
import { Fab } from '../../../../components/ui/Fab';
import { useTheme } from '../../../../context/ThemeContext';
import { Spacing } from '../../../../constants/theme';


export default function ServiceListScreen() {
  const { id: bikeId } = useLocalSearchParams<{ id: string }>();
  const api = useApiClient();
  const router = useRouter();
  const { colors } = useTheme();

  const [records, setRecords] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRecords(await api.services.getAll(bikeId));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load service records');
    } finally {
      setLoading(false);
    }
  }, [api, bikeId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: Spacing.lg, flexGrow: 1 }}
        ListEmptyComponent={<EmptyView title="No service visits logged yet" />}
        renderItem={({ item }) => (
          <ServiceCard
            item={item}
            onPress={() =>
              router.push({ pathname: '/bike/[id]/service/[serviceId]', params: { id: bikeId, serviceId: item._id } })
            }
          />
        )}
      />
      <Fab onPress={() => router.push({ pathname: '/bike/[id]/service/add', params: { id: bikeId } })} />
    </SafeAreaView>
  );
}