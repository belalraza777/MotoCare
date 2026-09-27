import { useCallback, useState } from 'react';
import { View, Text, FlatList, RefreshControl, StyleSheet } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useApiClient } from '../../api/client';
import { useUser } from '@clerk/clerk-expo';
import { Bike } from '../../types/bike.types';
import { BikeCard } from '../../components/Bike/BikeCard';
import { LoadingView, ErrorView } from '../../components/ui/StateViews';
import { Fab } from '../../components/ui/Fab';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function GarageScreen() {
  const api = useApiClient();
  const router = useRouter();
  const { user } = useUser();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setBikes(await api.bikes.getAll());
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load bikes');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  const firstName = user?.firstName || 'Rider';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>  
      <View style={styles.header}>
        <Text style={styles.greeting}>Good to see you,</Text>
        <Text style={styles.name}>{firstName} 🏍️</Text>
      </View>

      <FlatList
        data={bikes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={[
          styles.listContent,
          bikes.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); load(); }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyIcon}>🏍️</Text>
            <Text style={styles.emptyTitle}>Your garage is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add your first bike to start tracking service, fuel, and documents
            </Text>
            <View style={styles.emptyButton}>
              <Button label="Add Your First Bike" onPress={() => router.push('/bike/add')} />
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <BikeCard
            item={item}
            onPress={() => router.push({ pathname: '/bike/[id]', params: { id: item._id } })}
          />
        )}
      />

      {/* Only show the FAB once there's at least one bike — when empty,
          the big "Add Your First Bike" button above is the primary CTA,
          so a second floating button would be redundant */}
      {bikes.length > 0 && <Fab onPress={() => router.push('/bike/add')} bottomOffset={60} />}
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md },
    greeting: { fontSize: Typography.size.sm, color: colors.textSecondary },
    name: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: colors.text, marginTop: 2 },

    listContent: { padding: Spacing.lg, paddingTop: Spacing.sm, paddingBottom: 100 }, // clears the FAB
    listContentEmpty: { flexGrow: 1 },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
    emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
    emptyTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: colors.text },
    emptySubtitle: {
      fontSize: Typography.size.sm,
      color: colors.textMuted,
      textAlign: 'center',
      marginTop: Spacing.xs,
      marginBottom: Spacing.xl,
      lineHeight: 20,
    },
    emptyButton: { width: '100%' },
  });
}