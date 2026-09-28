import { Alert } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClient } from '../../../../api/client';
import { FuelForm } from '../../../../components/Fuel/FuelForm';
import { CreateFuelInput } from '../../../../types/fuel.types';

export default function AddFuelScreen() {
  const { id: bikeId } = useLocalSearchParams<{ id: string }>();
  const api = useApiClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateFuelInput) => {
    if (!data.litres || !data.totalAmount) {
      Alert.alert('Missing info', 'Litres and amount are required.');
      return;
    }
    setLoading(true);
    try {
      await api.fuel.create(bikeId, data);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to add entry');
    } finally {
      setLoading(false);
    }
  };

  return <FuelForm onSubmit={handleSubmit} submitLabel="Save" loading={loading} />;
}