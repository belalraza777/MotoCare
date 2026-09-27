import { Alert } from 'react-native';
import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useApiClient } from '../../../../api/client';
import { MaintenanceForm } from '../../../../components/Maintenance/MaintenanceForm';
import { CreateMaintenanceInput } from '../../../../types/maintenance.types';


export default function AddMaintenanceScreen() {
  const { id: bikeId } = useLocalSearchParams<{ id: string }>();
  const api = useApiClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: CreateMaintenanceInput) => {
    if (!data.odometer) {
      Alert.alert('Missing info', 'Odometer reading is required.');
      return;
    }
    setLoading(true);
    try {
      await api.maintenance.create(bikeId, data);
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to add record');
    } finally {
      setLoading(false);
    }
  };

  return <MaintenanceForm onSubmit={handleSubmit} submitLabel="Save" loading={loading} />;
}