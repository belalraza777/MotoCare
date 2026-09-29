import { useCallback, useState } from 'react';
import { View, FlatList, Text } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClient } from '../../../../api/client';
import { Fuel } from '../../../../types/fuel.types';
import { FuelCard } from '../../../../components/Fuel/FuelCard';
import { LoadingView, ErrorView, EmptyView } from '../../../../components/ui/StateViews';
import { Fab } from '../../../../components/ui/Fab';
import { useTheme } from '../../../../context/ThemeContext';
import { Spacing } from '../../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FuelListScreen() {
  const { id: bikeId } = useLocalSearchParams<{ id: string }>();
  const api = useApiClient();
  const router = useRouter();
  const { colors } = useTheme();

  const [records, setRecords] = useState<Fuel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRecords(await api.fuel.getAll(bikeId));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load fuel records');
    } finally {
      setLoading(false);
    }
  }, [api, bikeId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.text, marginBottom: Spacing.md, paddingHorizontal: Spacing.lg }}>
        Fuel Records
      </Text>
      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: Spacing.lg, flexGrow: 1 }}
        ListEmptyComponent={<EmptyView title="No fuel entries yet" />}
        renderItem={({ item }) => (
          <FuelCard
            item={item}
            onPress={() =>
              router.push({
                pathname: '/bike/[id]/fuel/[fuelId]/edit',
                params: { id: bikeId, fuelId: item._id },
              })
            }
          />
        )}
      />
      <Fab onPress={() => router.push({ pathname: '/bike/[id]/fuel/add', params: { id: bikeId } })} />
    </SafeAreaView>
  );
}