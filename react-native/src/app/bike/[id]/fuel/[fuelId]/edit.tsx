import { useCallback, useState } from 'react';
import { Alert, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClient } from '../../../../../api/client';
import { FuelForm } from '../../../../../components/Fuel/FuelForm';
import { Fuel, CreateFuelInput } from '../../../../../types/fuel.types';
import { LoadingView, ErrorView } from '../../../../../components/ui/StateViews';
import { Button } from '../../../../../components/ui/Button';
import { Spacing } from '../../../../../constants/theme';

export default function EditFuelScreen() {
  const { id: bikeId, fuelId } = useLocalSearchParams<{ id: string; fuelId: string }>();
  const api = useApiClient();
  const router = useRouter();

  const [record, setRecord] = useState<Fuel | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setRecord(await api.fuel.getOne(bikeId, fuelId));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load entry');
    } finally {
      setLoading(false);
    }
  }, [api, bikeId, fuelId]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleSubmit = async (data: CreateFuelInput) => {
    setSubmitting(true);
    try {
      await api.fuel.update(bikeId, fuelId, data);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to update entry');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Entry', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          setDeleting(true);
          try {
            await api.fuel.delete(bikeId, fuelId);
            router.back();
          } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message ?? 'Failed to delete entry');
            setDeleting(false);
          }
        },
      },
    ]);
  };

  if (loading) return <LoadingView />;
  if (error || !record) return <ErrorView message={error ?? 'Entry not found'} onRetry={load} />;

  return (
    <FuelForm
      initialValue={record}
      onSubmit={handleSubmit}
      submitLabel="Save Changes"
      loading={submitting}
      onDelete={handleDelete}
      deleting={deleting}
    />
  );
}