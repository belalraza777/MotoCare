import { useCallback, useState } from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApiClient } from '../../../../api/client';
import { Document, DocumentType } from '../../../../types/document.types';
import { DocumentCard } from '../../../../components/Document/DocumentCard';
import { LoadingView, ErrorView } from '../../../../components/ui/StateViews';
import { Button } from '../../../../components/ui/Button';
import { useTheme } from '../../../../context/ThemeContext';
import { Spacing, Typography, ThemeColors } from '../../../../constants/theme';

export default function DocumentListScreen() {
  const { id: bikeId } = useLocalSearchParams<{ id: string }>();
  const api = useApiClient();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // load documents for this bike
  const load = useCallback(async () => {
    setError(null);
    try {
      setDocs(await api.documents.getAll(bikeId));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load documents');
    } finally {
      setLoading(false);
    }
  }, [api, bikeId]);

  // refresh when screen is focused
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <LoadingView />;
  if (error) return <ErrorView message={error} onRetry={load} />;

  // navigation helpers
  const goToEdit = (documentId: string) =>
    router.push({ pathname: '/bike/[id]/documents/[documentId]/edit', params: { id: bikeId, documentId } });

  const goToAdd = (type: DocumentType) =>
    router.push({ pathname: '/bike/[id]/documents/add', params: { id: bikeId, type } });

  // split documents by type for display
  const insurance = docs.find((d) => d.type === 'INSURANCE');
  const puc = docs.find((d) => d.type === 'PUC');
  const rc = docs.find((d) => d.type === 'RC');
  const others = docs.filter((d) => d.type === 'OTHER');


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }} edges={['top']}>
      <Text style={styles.heading}>
        Documents Records
      </Text>
      <ScrollView contentContainerStyle={styles.content}>
        {insurance ? (
          <DocumentCard item={insurance} onPress={() => goToEdit(insurance._id)} />
        ) : (
          <Slot label="Add Insurance" onPress={() => goToAdd('INSURANCE')} />
        )}

        {puc ? (
          <DocumentCard item={puc} onPress={() => goToEdit(puc._id)} />
        ) : (
          <Slot label="Add PUC" onPress={() => goToAdd('PUC')} />
        )}

        {rc ? (
          <DocumentCard item={rc} onPress={() => goToEdit(rc._id)} />
        ) : (
          <Slot label="Add RC" onPress={() => goToAdd('RC')} />
        )}

        {/* OTHER: unlimited, shown as a list plus an always-available add slot */}
        {others.map((doc) => (
          <DocumentCard key={doc._id} item={doc} onPress={() => goToEdit(doc._id)} />
        ))}
        <Slot label="Add Other Document" onPress={() => goToAdd('OTHER')} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Slot({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <View style={{ marginBottom: Spacing.md }}>
      <Button label={label} onPress={onPress} variant="outline" />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
  heading: { fontSize: Typography.size.xxl, fontWeight: Typography.weight.bold, color: colors.text, paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.sm },
  content: { padding: Spacing.lg, paddingTop: Spacing.sm },
  });
}