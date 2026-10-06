import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useApiClient } from '../../api/client';
import { BikeForm } from '../../components/Bike/BikeForm';
import { CreateBikeInput } from '../../types/bike.types';
import { useState } from 'react';


export default function AddBikeScreen() {
  const api = useApiClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateBikeInput) => {
    if (!data.brand || !data.model) {
      Alert.alert('Missing info', 'Brand and model are required.');
      return;
    }
    setLoading(true);
    try {
      await api.bikes.create(data);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to add bike');
    } finally {
      setLoading(false);
    }
  };

  return <BikeForm onSubmit={handleSubmit} submitLabel="Add Bike" loading={loading} />;
}