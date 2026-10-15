import { useCallback, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Bike as BikeIcon, CheckCircle2, ShieldCheck, Sparkles, Warehouse, Wrench } from 'lucide-react-native';
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
          <View style={styles.header}>
            <View style={styles.brandHeader}>
              <View style={styles.brandMark}>
                <Image
                  source={require('../../../assets/motocarelogo.png')}
                  style={styles.brandLogo}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.brandCopy}>
                <Text style={styles.brandName}>MotoCare</Text>
                <Text style={styles.brandTagline}>Ride better · Maintain longer</Text>
              </View>
            </View>

            {bikes.length > 0 ? (
              <>
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
                </View>
                </LinearGradient>

                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Your Garage</Text>
                  <View style={styles.countBadge}>
                    <Text style={styles.countText}>{bikes.length}</Text>
                  </View>
                </View>
              </>
            ) : null}
          </View>
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
            <View style={styles.emptyCard}>
              <LinearGradient
                colors={[colors.primary, colors.primary + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.emptyBanner}
              >
                <View style={styles.emptySparkle}>
                  <Sparkles size={16} color="#fff" strokeWidth={2.2} />
                </View>
                <View style={styles.emptyIcon}>
                  <Warehouse size={42} color="#fff" strokeWidth={1.8} />
                  <View style={styles.emptyBikeBadge}>
                    <BikeIcon size={20} color={colors.primary} strokeWidth={2.2} />
                  </View>
                </View>
                <Text style={styles.emptyBannerText}>Your ride deserves a home</Text>
              </LinearGradient>

              <View style={styles.emptyContent}>
                <Text style={styles.emptyTitle}>Build your digital garage</Text>
                <Text style={styles.emptySubtitle}>
                  Keep every service, maintenance reminder, fuel entry, and document for your bike in one place.
                </Text>

                <View style={styles.emptyBenefits}>
                  <View style={styles.emptyBenefit}>
                    <CheckCircle2 size={17} color={colors.success} strokeWidth={2.2} />
                    <Text style={styles.emptyBenefitText}>Stay on top of service</Text>
                  </View>
                  <View style={styles.emptyBenefit}>
                    <Wrench size={17} color={colors.primary} strokeWidth={2.2} />
                    <Text style={styles.emptyBenefitText}>Track maintenance with ease</Text>
                  </View>
                  <View style={styles.emptyBenefit}>
                    <ShieldCheck size={17} color={colors.info} strokeWidth={2.2} />
                    <Text style={styles.emptyBenefitText}>Keep records ready</Text>
                  </View>
                </View>

                <View style={styles.emptyButton}>
                  <Button label="Add Your First Bike" onPress={() => router.push('/bike/add')} />
                </View>
              </View>
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
    brandHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: Spacing.xs,
      marginBottom: Spacing.lg,
    },
    brandMark: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.text,
      shadowOpacity: 0.06,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    brandLogo: { width: 36, height: 36 },
    brandCopy: { flex: 1, marginLeft: Spacing.md },
    brandName: {
      fontSize: Typography.size.xl,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      letterSpacing: 0.4,
    },
    brandTagline: {
      fontSize: Typography.size.xs,
      color: colors.textMuted,
      marginTop: 3,
      letterSpacing: 0.2,
    },

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

    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xl },
    emptyCard: {
      width: '100%',
      overflow: 'hidden',
      borderRadius: Radius.xl,
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.08,
      shadowRadius: 14,
      elevation: 3,
    },
    emptyBanner: {
      minHeight: 174,
      alignItems: 'center',
      justifyContent: 'center',
      padding: Spacing.lg,
      position: 'relative',
    },
    emptySparkle: {
      position: 'absolute',
      top: Spacing.md,
      right: Spacing.lg,
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.18)',
    },
    emptyIcon: {
      width: 82,
      height: 82,
      borderRadius: 26,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(255,255,255,0.18)',
      position: 'relative',
    },
    emptyBikeBadge: {
      position: 'absolute',
      right: -8,
      bottom: -5,
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: 'rgba(255,255,255,0.7)',
    },
    emptyBannerText: {
      marginTop: Spacing.md,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.semibold,
      color: '#fff',
    },
    emptyContent: {
      padding: Spacing.xl,
      alignItems: 'center',
    },
    emptyTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: colors.text, textAlign: 'center' },
    emptySubtitle: {
      fontSize: Typography.size.sm,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: 20,
      marginTop: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    emptyBenefits: {
      width: '100%',
      gap: Spacing.sm,
      marginBottom: Spacing.xl,
    },
    emptyBenefit: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: Radius.md,
      backgroundColor: colors.background,
    },
    emptyBenefitText: {
      marginLeft: Spacing.sm,
      fontSize: Typography.size.sm,
      color: colors.textSecondary,
      fontWeight: Typography.weight.medium,
    },
    emptyButton: { width: '100%' },
  });
}