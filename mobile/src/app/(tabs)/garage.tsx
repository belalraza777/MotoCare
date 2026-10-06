import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bike as BikeIcon, Warehouse } from 'lucide-react-native';
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

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

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

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  const firstName = user?.firstName || 'Rider';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <FlatList
        data={bikes}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.listContent,
          bikes.length === 0 && styles.listContentEmpty,
        ]}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        ListHeaderComponent={
          bikes.length > 0 ? (
            <View style={styles.header}>
              <LinearGradient
                colors={[colors.primary, colors.primary + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.hero}
              >
                <View style={styles.heroTop}>
                  <View>
                    <Text style={styles.heroGreeting}>{getGreeting()},</Text>
                    <Text style={styles.heroName}>{firstName}</Text>
                  </View>
                  <View style={styles.heroIconCircle}>
                    <BikeIcon size={26} color="#fff" strokeWidth={2.2} />
                  </View>
                </View>

                <View style={styles.heroStatsRow}>
                  <View style={styles.heroStatIcon}>
                    <Warehouse size={24} color="#fff" strokeWidth={2.2} />
                  </View>
                  <View style={styles.heroStatContent}>
                    <Text style={styles.heroStatLabel}>Your garage</Text>
                    <Text style={styles.heroStatValue}>
                      {bikes.length} {bikes.length === 1 ? 'bike' : 'bikes'} ready to ride
                    </Text>
                  </View>
                  <Text style={styles.heroStatCount}>{bikes.length}</Text>
                </View>
              </LinearGradient>

              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Your Garage</Text>
                <View style={styles.countBadge}>
                  <Text style={styles.countText}>{bikes.length}</Text>
                </View>
              </View>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.cardWrapper}>
            <BikeCard
              item={item}
              onPress={() =>
                router.push({ pathname: '/bike/[id]', params: { id: item._id } })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <LinearGradient
              colors={[colors.primary, colors.primary + 'CC']}
              style={styles.emptyIcon}
            >
              <BikeIcon size={40} color="#fff" strokeWidth={2} />
            </LinearGradient>

            <Text style={styles.emptyTitle}>Your garage is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add your first bike to keep track of its service, maintenance, fuel, and documents.
            </Text>

            <View style={styles.emptyButton}>
              <Button label="Add Your First Bike" onPress={() => router.push('/bike/add')} />
            </View>
          </View>
        }
      />

      {bikes.length > 0 && <Fab onPress={() => router.push('/bike/add')} bottomOffset={65} />}
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },

    listContent: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: 110 },
    listContentEmpty: { flexGrow: 1 },

    header: { marginBottom: Spacing.lg },

    hero: {
      borderRadius: Radius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.xl,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 6,
    },
    heroTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: Spacing.lg,
    },
    heroGreeting: { fontSize: Typography.size.sm, color: 'rgba(255,255,255,0.85)' },
    heroName: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: '#fff', marginTop: 2 },
    heroIconCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255,255,255,0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },

    heroStatsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.15)',
      borderRadius: Radius.lg,
      padding: Spacing.md,
    },
    heroStatIcon: {
      width: 44,
      height: 44,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    heroStatContent: { flex: 1, marginLeft: Spacing.md },
    heroStatLabel: {
      fontSize: Typography.size.xs,
      color: 'rgba(255,255,255,0.78)',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    heroStatValue: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
      color: '#fff',
      marginTop: 3,
    },
    heroStatCount: {
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.bold,
      color: '#fff',
      marginLeft: Spacing.sm,
    },
    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    sectionTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: colors.text },
    countBadge: {
      minWidth: 28,
      height: 28,
      paddingHorizontal: Spacing.sm,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    countText: { fontSize: Typography.size.xs, fontWeight: Typography.weight.bold, color: colors.text },

    cardWrapper: { marginBottom: Spacing.md },

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: Spacing.xl },
    emptyIcon: {
      width: 88,
      height: 88,
      borderRadius: 28,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: Spacing.lg,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 5,
    },
    emptyTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: colors.text, textAlign: 'center' },
    emptySubtitle: {
      fontSize: Typography.size.sm,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginTop: Spacing.sm,
      marginBottom: Spacing.xl,
    },
    emptyButton: { width: '100%' },
  });
}