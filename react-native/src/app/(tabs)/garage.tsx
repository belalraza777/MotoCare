import { useCallback, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, RefreshControl } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useApiClient } from '../../api/client';
import { Bike } from '../../types/bike.types';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

export default function GarageScreen() {
  const api = useApiClient();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load bikes from the API
  const loadBikes = useCallback(async () => {
    setError(null);
    try {
      const data = await api.bikes.getAll();
      setBikes(data);
    } catch (err: any) {
      console.error('Failed to load bikes:', err);

      // Distinguish between a real server error, a network/connectivity
      // failure, and anything else — so the message actually helps the user
      if (err.response) {
        setError(err.response.data?.message ?? 'Something went wrong. Please try again.');
      } else if (err.request) {
        setError('Cannot reach the server. Check your connection and try again.');
      } else {
        setError('Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [api]);

  // Refetch every time this screen comes into focus — catches bikes added
  // on the Add Bike screen without needing a manual refresh
  useFocusEffect(
    useCallback(() => {
      loadBikes();
    }, [loadBikes])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadBikes();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <Text style={{ color: colors.text }}>Loading...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadBikes}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text>Welcome to the Garage</Text>

      <FlatList
        data={bikes}
        keyExtractor={(item) => item._id}
        contentContainerStyle={bikes.length === 0 ? styles.center : styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary} // spinner color on iOS
            colors={[colors.primary]} // spinner color on Android
          />
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No bikes yet</Text>
            <Text style={styles.emptySubtext}>Add your first bike to get started</Text>
          </View>
        }
        renderItem={({ item }) => (
          // Each bike navigates to its dashboard via a typed dynamic route
          <TouchableOpacity
            style={styles.bikeCard}
            onPress={() => router.push({ pathname: '/bike/[id]', params: { id: item._id } })}
          >
            <Text style={styles.bikeName}>{item.brand} {item.model}</Text>
            {item.variant ? <Text style={styles.bikeVariant}>{item.variant}</Text> : null}
            <View style={styles.bikeMeta}>
              <Text style={styles.bikeMetaText}>{item.currentKm.toLocaleString()} km</Text>
              <Text style={styles.bikeMetaText}>•</Text>
              <Text style={styles.bikeMetaText}>{item.fuelType}</Text>
            </View>
          </TouchableOpacity>
        )}
      />

      {/* Floating action button — always visible, opens the Add Bike form */}
      <TouchableOpacity style={styles.fab} onPress={() => router.push('/bike/add')}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
    list: { padding: Spacing.lg },

    empty: { alignItems: 'center', marginTop: 100 },
    emptyText: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.semibold,
      color: colors.text,
    },
    emptySubtext: {
      fontSize: Typography.size.sm,
      color: colors.textMuted,
      marginTop: Spacing.xs,
    },

    errorText: {
      fontSize: Typography.size.md - 1,
      color: colors.error,
      textAlign: 'center',
      marginBottom: Spacing.lg,
    },
    retryButton: {
      backgroundColor: colors.primary,
      paddingVertical: Spacing.md - 2,
      paddingHorizontal: Spacing.xl,
      borderRadius: Radius.sm,
    },
    retryButtonText: { color: '#fff', fontWeight: Typography.weight.semibold },

    bikeCard: {
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    bikeName: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      color: colors.text,
    },
    bikeVariant: {
      fontSize: Typography.size.sm,
      color: colors.textSecondary,
      marginTop: 2,
    },
    bikeMeta: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
    bikeMetaText: { fontSize: Typography.size.xs + 1, color: colors.textMuted },

    // Fixed position bottom-right, floats above the list content
    fab: {
      position: 'absolute',
      bottom: Spacing.lg + 8,
      right: Spacing.lg + 8,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4, // Android shadow
      shadowColor: '#000', // iOS shadow
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    fabText: { color: '#fff', fontSize: 28, lineHeight: 30 },
  });
}