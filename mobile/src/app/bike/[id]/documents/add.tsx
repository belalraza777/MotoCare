import { Alert } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClient } from '../../../../api/client';
import { DocumentForm } from '../../../../components/Document/DocumentForm';
import { SaveDocumentInput, DocumentType } from '../../../../types/document.types';

export default function AddDocumentScreen() {
  const { id: bikeId, type } = useLocalSearchParams<{ id: string; type: DocumentType }>();
  const api = useApiClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: SaveDocumentInput) => {
    setLoading(true);
    try {
      await api.documents.save(bikeId, data);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to save document');
    } finally {
      setLoading(false);
    }
  };

  return <DocumentForm type={type} onSubmit={handleSubmit} loading={loading} />;
}