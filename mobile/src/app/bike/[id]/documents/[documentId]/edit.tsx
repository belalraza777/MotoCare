import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClient } from '../../../../../api/client';
import { DocumentForm } from '../../../../../components/Document/DocumentForm';
import { Document, SaveDocumentInput } from '../../../../../types/document.types';
import { LoadingView, ErrorView } from '../../../../../components/ui/StateViews';

export default function EditDocumentScreen() {
  const { id: bikeId, documentId } =
    useLocalSearchParams<{ id: string; documentId: string }>();

  const api = useApiClient();
  const router = useRouter();

  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    try {
      setDoc(await api.documents.getOne(bikeId, documentId));
    } catch (err: any) {
      setError(
        err.response?.data?.message ?? 'Failed to load document'
      );
    } finally {
      setLoading(false);
    }
  }, [api, bikeId, documentId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleSubmit = async (data: SaveDocumentInput) => {
    setSubmitting(true);

    try {
      await api.documents.save(bikeId, data);
      router.back();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message ?? 'Failed to update document'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Document',
      'This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setDeleting(true);

            try {
              await api.documents.delete(bikeId, documentId);
              router.back();
            } catch (err: any) {
              Alert.alert(
                'Error',
                err.response?.data?.message ?? 'Failed to delete'
              );
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  if (loading) return <LoadingView />;

  if (error || !doc) {
    return (
      <ErrorView
        message={error ?? 'Not found'}
        onRetry={load}
      />
    );
  }

  return (
    <DocumentForm
      type={doc.type}
      initialValue={doc}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      loading={submitting}
      deleting={deleting}
    />
  );
}