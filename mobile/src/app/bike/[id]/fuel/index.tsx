import { useCallback, useState } from 'react';
import { FlatList, Text, StyleSheet } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClient } from '../../../../api/client';
import { Fuel } from '../../../../types/fuel.types';
import { FuelCard } from '../../../../components/Fuel/FuelCard';
import { LoadingView, ErrorView, EmptyView } from '../../../../components/ui/StateViews';
import { Fab } from '../../../../components/ui/Fab';
import { useTheme } from '../../../../context/ThemeContext';
import { Spacing, Typography, ThemeColors } from '../../../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FuelListScreen() {
  const { id: bikeId } = useLocalSearchParams<{ id: string }>();
  const api = useApiClient();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

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
      <Text style={styles.heading}>
        Fuel Records
      </Text>
      <FlatList
        data={records}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
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

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  heading: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: colors.text, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  listContent: { padding: Spacing.lg, paddingTop: Spacing.sm, flexGrow: 1 },
  });
}