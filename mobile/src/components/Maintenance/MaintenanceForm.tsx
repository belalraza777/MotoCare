import { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextField } from '../../components/ui/TextField';
import { DateField } from '../../components/ui/DateField';
import { ChipSelect } from '../../components/ui/ChipSelect';
import { Button } from '../../components/ui/Button';
import { Maintenance, MaintenanceType, CreateMaintenanceInput } from '../../types/maintenance.types';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Radius, Typography, ThemeColors } from '../../constants/theme';

const MAINTENANCE_TYPES: MaintenanceType[] = [
  'ENGINE_OIL', 'OIL_FILTER', 'AIR_FILTER', 'BRAKES', 'TYRE',
  'BATTERY', 'SPARK_PLUG', 'GEAR_OIL', 'COOLANT', 'CHAIN',
  'CHAIN_LUBRICATION', 'CLUTCH', 'GENERAL_CHECK', 'OTHER',
];

interface MaintenanceFormProps {
  initialValue?: Maintenance; // present = edit mode, absent = add mode
  onSubmit: (data: CreateMaintenanceInput) => Promise<void>;
  submitLabel: string; // used for the button text only
  loading: boolean;
  onDelete?: () => void;
}

export function MaintenanceForm({ initialValue, onSubmit, onDelete, submitLabel, loading  }: MaintenanceFormProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [type, setType] = useState<MaintenanceType>(initialValue?.type ?? 'ENGINE_OIL');
  const [brand, setBrand] = useState(initialValue?.brand ?? '');
  const [date, setDate] = useState(
    initialValue?.date ? new Date(initialValue.date) : new Date()
  );
  const [odometer, setOdometer] = useState(initialValue?.odometer?.toString() ?? '');
  const [cost, setCost] = useState(initialValue?.cost?.toString() ?? '');
  const [notes, setNotes] = useState(initialValue?.notes ?? '');

  const handleSubmit = () => {
    onSubmit({
      type,
      brand: brand.trim() || undefined,
      date: date.toISOString(),
      odometer: Number(odometer),
      cost: cost ? Number(cost) : 0,
      notes: notes.trim() || undefined,
    });
  };

  // Screen title reflects the mode (add vs edit), separate from the
  // button's own label — these shouldn't share the same string
  const screenTitle = initialValue ? 'Edit Maintenance' : 'Add Maintenance';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>{screenTitle}</Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <ChipSelect
            label="Type"
            options={MAINTENANCE_TYPES}
            value={type}
            onChange={setType}
            formatLabel={(t) => t.replace(/_/g, ' ')}
          />

          <TextField label="Brand (optional)" placeholder="e.g. Motul" value={brand} onChangeText={setBrand} />
          <DateField label="Date" value={date} onChange={setDate} />
          <TextField label="Odometer (km)" placeholder="e.g. 8500" value={odometer} onChangeText={setOdometer} keyboardType="numeric" />
          <TextField label="Cost (₹)" placeholder="e.g. 650" value={cost} onChangeText={setCost} keyboardType="numeric" />
          <TextField
            label="Notes (optional)"
            placeholder="Any details..."
            value={notes}
            onChangeText={setNotes}
            multiline
            style={styles.notesInput}
          />

          <Button label={submitLabel} onPress={handleSubmit} loading={loading} />
          {initialValue && onDelete && (
            <Button label="Delete" onPress={onDelete} loading={loading} variant="danger" />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: colors.background },
    flex: { flex: 1 },

    header: {
      paddingHorizontal: Spacing.lg,
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    title: {
      fontSize: Typography.size.xl,
      fontWeight: Typography.weight.bold,
      color: colors.text,
    },

    container: {
      padding: Spacing.lg,
      paddingBottom: Spacing.xl * 4,
      gap: Spacing.md,
    },
    notesInput: { height: 80, textAlignVertical: 'top' },
  });
}