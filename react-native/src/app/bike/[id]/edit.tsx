import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClient } from '../../../api/client';
import { BikeForm } from '../../../components/Bike/BikeForm';
import { Bike, CreateBikeInput } from '../../../types/bike.types';
import { LoadingView, ErrorView } from '../../../components/ui/StateViews';


export default function EditBikeScreen() {
  const { id: bikeId } = useLocalSearchParams<{ id: string }>();
  const api = useApiClient();
  const router = useRouter();

  const [bike, setBike] = useState<Bike | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setBike(await api.bikes.getOne(bikeId));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load bike');
    } finally {
      setLoading(false);
    }
  }, [api, bikeId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSubmit = async (data: CreateBikeInput) => {
    setSubmitting(true);
    try {
      await api.bikes.update(bikeId, data);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to update bike');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingView />;
  if (error || !bike) return <ErrorView message={error ?? 'Bike not found'} onRetry={load} />;

  return (
    
    <BikeForm
      initialValue={bike}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      loading={submitting}
    />
  );
}