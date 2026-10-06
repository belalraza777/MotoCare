import { useCallback, useState } from 'react';
import { Alert } from 'react-native';
import {
  useFocusEffect,
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { useApiClient } from '../../../../../api/client';
import { MaintenanceForm } from '../../../../../components/Maintenance/MaintenanceForm';
import { Maintenance, CreateMaintenanceInput } from '../../../../../types/maintenance.types';
import { LoadingView, ErrorView } from '../../../../../components/ui/StateViews';


export default function EditMaintenanceScreen() {
  const { id: bikeId, maintenanceId } =
    useLocalSearchParams<{ id: string; maintenanceId: string }>();

  const api = useApiClient();
  const router = useRouter();

  const [record, setRecord] = useState<Maintenance | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError(null);

    try {
      setRecord(await api.maintenance.getOne(bikeId, maintenanceId));
    } catch (err: any) {
      setError(err.response?.data?.message ?? 'Failed to load record');
    } finally {
      setLoading(false);
    }
  }, [api, bikeId, maintenanceId]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleSubmit = async (data: CreateMaintenanceInput) => {
    setSubmitting(true);

    try {
      await api.maintenance.update(bikeId, maintenanceId, data);
      router.back();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message ?? 'Failed to update record'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);

    try {
      await api.maintenance.delete(bikeId, maintenanceId);
      router.back();
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.response?.data?.message ?? 'Failed to delete record'
      );
      setDeleting(false);
    }
  };

  if (loading) {
    return <LoadingView />;
  }

  if (error || !record) {
    return (
      <ErrorView
        message={error ?? 'Record not found'}
        onRetry={load}
      />
    );
  }

  return (
    <MaintenanceForm
      initialValue={record}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      submitLabel="Save Changes"
      loading={submitting}
    />
  );
}