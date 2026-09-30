import { Alert } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClient } from '../../../../api/client';
import { ServiceForm } from '../../../../components/Service/ServiceForm';
import { CreateServiceInput } from '../../../../types/service.types';

export default function AddServiceScreen() {
  const { id: bikeId } = useLocalSearchParams<{ id: string }>();
  const api = useApiClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateServiceInput) => {
    setLoading(true);
    try {
      await api.services.create(bikeId, data);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to save service visit');
    } finally {
      setLoading(false);
    }
  };

  return <ServiceForm onSubmit={handleSubmit} loading={loading} />;
}