import { useState } from 'react';
import { ScrollView, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextField } from '../../components/ui/TextField';
import { ChipSelect } from '../../components/ui/ChipSelect';
import { Button } from '../../components/ui/Button';
import { Bike, FuelType, CreateBikeInput } from '../../types/bike.types';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Typography, ThemeColors } from '../../constants/theme';

const FUEL_TYPES: FuelType[] = ['PETROL', 'ELECTRIC', 'DIESEL', 'HYBRID'];

interface BikeFormProps {
  initialValue?: Bike; // present = edit mode, absent = add mode
  onSubmit: (data: CreateBikeInput) => Promise<void>;
  submitLabel: string; // used for the button text only
  loading: boolean;
}

// Single form shared by Add Bike and Edit Bike — the only difference between
// the two screens is what onSubmit does with the data, not the fields themselves.
export function BikeForm({ initialValue, onSubmit, submitLabel, loading }: BikeFormProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [brand, setBrand] = useState(initialValue?.brand ?? '');
  const [model, setModel] = useState(initialValue?.model ?? '');
  const [variant, setVariant] = useState(initialValue?.variant ?? '');
  const [registrationNumber, setRegistrationNumber] = useState(initialValue?.registrationNumber ?? '');
  const [fuelType, setFuelType] = useState<FuelType>(initialValue?.fuelType ?? 'PETROL');
  const [currentKm, setCurrentKm] = useState(initialValue?.currentKm?.toString() ?? '');
  const [serviceIntervalKm, setServiceIntervalKm] = useState(initialValue?.serviceIntervalKm?.toString() ?? '3000');

  const handleSubmit = () => {
    onSubmit({
      brand: brand.trim(),
      model: model.trim(),
      variant: variant.trim() || undefined,
      registrationNumber: registrationNumber.trim() || undefined,
      fuelType,
      currentKm: currentKm ? Number(currentKm) : 0,
      serviceIntervalKm: Number(serviceIntervalKm) || 3000,
    });
  };

  // Screen title reflects the mode (add vs edit) — kept separate from
  // submitLabel, which belongs to the button only
  const screenTitle = initialValue ? 'Edit Bike' : 'Add Bike';

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
          <TextField label="Brand" placeholder="e.g. Honda" value={brand} onChangeText={setBrand} />
          <TextField label="Model" placeholder="e.g. Shine" value={model} onChangeText={setModel} />
          <TextField label="Variant (optional)" placeholder="e.g. Disc" value={variant} onChangeText={setVariant} />
          <TextField label="Registration Number (optional)" placeholder="e.g. BR33 1234" value={registrationNumber} onChangeText={setRegistrationNumber} />

          <ChipSelect label="Fuel Type" options={FUEL_TYPES} value={fuelType} onChange={setFuelType} />

          <TextField label="Current KM" placeholder="Default 0" value={currentKm} onChangeText={setCurrentKm} keyboardType="numeric" />
          <TextField label="Service Interval (KM)" placeholder="Default 3000" value={serviceIntervalKm} onChangeText={setServiceIntervalKm} keyboardType="numeric" />

          <Button label={submitLabel} onPress={handleSubmit} loading={loading} />
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

    container: { padding: Spacing.lg, paddingBottom: Spacing.xl * 2 },
  });
}