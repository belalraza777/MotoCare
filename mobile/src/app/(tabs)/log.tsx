import { useCallback, useRef, useState } from 'react';
import { View, Text, FlatList, RefreshControl, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useRouter } from 'expo-router';
import { useApiClient } from '../../api/client';
import { Bike } from '../../types/bike.types';
import { LogItem, LogTypeFilter } from '../../types/log.types';
import { LogCard } from '../../components/Log/LogCard';
import { ChipSelect } from '../../components/ui/ChipSelect';
import { LoadingView, ErrorView, EmptyView } from '../../components/ui/StateViews';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Typography, ThemeColors } from '../../constants/theme';

const STEP = 20; // har baar itne aur items maangte hain
const TYPES: LogTypeFilter[] = ['all', 'fuel', 'service', 'maintenance'];
const TYPE_LABEL: Record<LogTypeFilter, string> = {
  all: 'All',
  fuel: 'Fuel',
  service: 'Service',
  maintenance: 'Maintenance',
};

export default function LogsScreen() {
  const api = useApiClient();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const apiRef = useRef(api); // latest api ek ref mein, taaki bar-bar reload na ho
  apiRef.current = api;

  const [type, setType] = useState<LogTypeFilter>('all');
  const [bikeId, setBikeId] = useState('ALL');
  const [bikes, setBikes] = useState<Bike[]>([]);

  const [limit, setLimit] = useState(STEP); // abhi kitne items maange hain
  const [items, setItems] = useState<LogItem[]>([]);
  const [hasMore, setHasMore] = useState(false);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0); // isse badlo to list dobara load hogi

  // Jab bhi filter, limit ya reloadKey badle, list server se dobara aati hai.
  // Poori list replace hoti hai, isliye duplicate ka sawal hi nahi.
  useFocusEffect(
    useCallback(() => {
      let ignore = false; // purana jawab late aaye to ignore

      setLoading(true);
      setError(null);

      apiRef.current.logs
        .getPage({ type, bikeId: bikeId === 'ALL' ? undefined : bikeId, limit })
        .then((res) => {
          if (ignore) return;
          setItems(res.items);
          setHasMore(res.hasMore);
        })
        .catch((err) => {
          if (!ignore) setError(err.response?.data?.message ?? 'Failed to load logs');
        })
        .finally(() => {
          if (ignore) return;
          setLoading(false);
          setRefreshing(false);
        });

      return () => {
        ignore = true;
      };
    }, [type, bikeId, limit, reloadKey])
  );

  // Filter chips ke liye bikes. Selected bike delete ho gayi ho to "All" par wapas.
  useFocusEffect(
    useCallback(() => {
      apiRef.current.bikes
        .getAll()
        .then((list) => {
          setBikes(list);
          setBikeId((prev) => (prev === 'ALL' || list.some((b) => b._id === prev) ? prev : 'ALL'));
        })
        .catch(() => {}); // chips optional hain, list phir bhi chalegi
    }, [])
  );

  const changeType = (t: LogTypeFilter) => {
    setItems([]);
    setLimit(STEP); // naye filter par wapas 20 se shuru
    setType(t);
  };

  const changeBike = (id: string) => {
    setItems([]);
    setLimit(STEP);
    setBikeId(id);
  };

  // List ke end par pahunche to 20 aur maango
  const loadMore = () => {
    if (hasMore && !loading) setLimit((l) => l + STEP);
  };

  const openLog = useCallback(
    (item: LogItem) => {
      if (item.kind === 'SERVICE') {
        router.push({ pathname: '/bike/[id]/service/[serviceId]', params: { id: item.bikeId, serviceId: item._id } });
      } else if (item.serviceId) {
        router.push({ pathname: '/bike/[id]/service/[serviceId]', params: { id: item.bikeId, serviceId: item.serviceId } });
      }
    },
    [router]
  );

  const bikeLabel = (id: string) => {
    const bike = bikes.find((b) => b._id === id);
    return id === 'ALL' ? 'All bikes' : bike ? `${bike.brand} ${bike.model}` : 'Bike';
  };

  let body;
  if (error && items.length === 0) {
    body = <ErrorView message={error} onRetry={() => setReloadKey((k) => k + 1)} />;
  } else if (loading && items.length === 0) {
    body = <LoadingView />;
  } else {
    body = (
      <FlatList
        data={items}
        keyExtractor={(item) => `${item.kind}-${item._id}`}
        renderItem={({ item }) => (
          <LogCard
            item={item}
            onPress={item.kind === 'SERVICE' || Boolean(item.serviceId) ? openLog : undefined}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              setLimit(STEP);
              setReloadKey((k) => k + 1);
            }}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        ListEmptyComponent={<EmptyView title="No logs yet" subtitle="Fuel, service and maintenance entries show up here" />}
        ListFooterComponent={loading && items.length > 0 ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : null}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Logs</Text>
        <ChipSelect label="Type" options={TYPES} value={type} onChange={changeType} formatLabel={(t) => TYPE_LABEL[t]} />
        {/* bike filter tabhi jab 2 ya zyada bikes hon */}
        {bikes.length > 1 && (
          <ChipSelect
            label="Bike"
            options={['ALL', ...bikes.map((b) => b._id)]}
            value={bikeId}
            onChange={changeBike}
            formatLabel={bikeLabel}
          />
        )}
      </View>

      <View style={styles.body}>{body}</View>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    header: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg },
    title: {
      fontSize: Typography.size.xxl,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginBottom: Spacing.md,
    },
    body: { flex: 1 },
    listContent: { paddingHorizontal: Spacing.lg, paddingBottom: Spacing.xl, flexGrow: 1 },
    footer: { paddingVertical: Spacing.lg },
  });
}