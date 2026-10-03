import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Image,
} from 'react-native';
import { SvgUri } from 'react-native-svg';
import { useFocusEffect, useRouter } from 'expo-router';
import { useApiClient } from '../../api/client';
import { useUser } from '@clerk/clerk-expo';
import { Bike } from '../../types/bike.types';
import { BikeCard } from '../../components/Bike/BikeCard';
import { LoadingView, ErrorView } from '../../components/ui/StateViews';
import { Fab } from '../../components/ui/Fab';
import { Button } from '../../components/ui/Button';
import { useTheme } from '../../context/ThemeContext';
import {
  Radius,
  Spacing,
  Typography,
  ThemeColors,
} from '../../constants/theme';
import { SafeAreaView } from 'react-native-safe-area-context';

const bikeIconUri = Image.resolveAssetSource(
  require('../../../assets/bikeIcon.svg')
).uri;

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
              <View style={styles.greetingRow}>
                <View style={styles.headerText}>
                  <Text style={styles.greeting}>Good to see you,</Text>
                  <Text style={styles.name}>{firstName}</Text>
                </View>

                <View style={styles.headerIcon}>
                  <SvgUri uri={bikeIconUri} width={28} height={28} fill={colors.primary} />
                </View>
              </View>

              <View style={styles.sectionHeader}>
                <View>
                  <Text style={styles.sectionTitle}>Your Garage</Text>
                  <Text style={styles.sectionSubtitle}>
                    {bikes.length === 1
                      ? '1 bike in your garage'
                      : `${bikes.length} bikes in your garage`}
                  </Text>
                </View>

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
                router.push({
                  pathname: '/bike/[id]',
                  params: { id: item._id },
                })
              }
            />
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <View style={styles.emptyIcon}>
              <SvgUri uri={bikeIconUri} width={44} height={44} fill={colors.primary} />
            </View>

            <Text style={styles.emptyTitle}>Your garage is empty</Text>

            <Text style={styles.emptySubtitle}>
              Add your first bike to keep track of its service, maintenance,
              fuel, and documents.
            </Text>

            <View style={styles.emptyButton}>
              <Button
                label="Add Your First Bike"
                onPress={() => router.push('/bike/add')}
              />
            </View>
          </View>
        }
      />

      {bikes.length > 0 && (
        <Fab
          onPress={() => router.push('/bike/add')}
          bottomOffset={65}
        />
      )}
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },

    listContent: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.lg,
      paddingBottom: 110,
    },

    listContentEmpty: {
      flexGrow: 1,
    },

    header: {
      marginBottom: Spacing.lg,
    },

    greetingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: Spacing.xl,
    },

    headerText: {
      flex: 1,
    },

    greeting: {
      fontSize: Typography.size.sm,
      color: colors.textSecondary,
    },

    name: {
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginTop: Spacing.xs,
    },

    headerIcon: {
      width: 46,
      height: 46,
      borderRadius: Radius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '12',
      borderWidth: 1,
      borderColor: colors.primary + '20',
    },

    sectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },

    sectionTitle: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      color: colors.text,
    },

    sectionSubtitle: {
      fontSize: Typography.size.sm,
      color: colors.textSecondary,
      marginTop: 3,
    },

    countBadge: {
      minWidth: 34,
      height: 34,
      paddingHorizontal: Spacing.sm,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },

    countText: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.bold,
      color: colors.text,
    },

    cardWrapper: {
      marginBottom: Spacing.md,
    },

    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: Spacing.xl,
    },

    emptyIcon: {
      width: 76,
      height: 76,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary + '12',
      borderWidth: 1,
      borderColor: colors.primary + '20',
      marginBottom: Spacing.lg,
    },

    emptyTitle: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      textAlign: 'center',
    },

    emptySubtitle: {
      fontSize: Typography.size.sm,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginTop: Spacing.sm,
      marginBottom: Spacing.xl,
    },

    emptyButton: {
      width: '100%',
    },
  });
}