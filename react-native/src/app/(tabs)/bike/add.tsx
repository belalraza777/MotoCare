import { useState } from 'react';
import {
  View,Text,TextInput, TouchableOpacity,StyleSheet,ScrollView,Alert,KeyboardAvoidingView,Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApiClient } from '../../../api/client';
import { FuelType } from '../../../types/bike.types';
import { useTheme } from '../../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../../constants/theme';

const FUEL_TYPES: FuelType[] = ['PETROL', 'ELECTRIC', 'DIESEL', 'HYBRID'];

export default function AddBikeScreen() {
  const api = useApiClient();
  const router = useRouter();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Form state
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [variant, setVariant] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [fuelType, setFuelType] = useState<FuelType>('PETROL');
  const [currentKm, setCurrentKm] = useState('');
  const [serviceIntervalKm, setServiceIntervalKm] = useState('3000');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!brand.trim() || !model.trim()) {
      Alert.alert('Missing info', 'Brand and model are required.');
      return;
    }
    setLoading(true);
    try {
      await api.bikes.create({
        brand: brand.trim(),
        model: model.trim(),
        variant: variant.trim() || undefined,
        registrationNumber: registrationNumber.trim() || undefined,
        fuelType,
        currentKm: currentKm ? Number(currentKm) : 0,
        serviceIntervalKm: Number(serviceIntervalKm) || 3000,
      });
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message ?? 'Failed to add bike');
    } finally {
      setLoading(false);
    }
  };

  return (
    // KeyboardAvoidingView pushes content up so the active input stays visible
    // above the keyboard — 'padding' works best on iOS, 'height' on Android
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled" // lets taps on chips/buttons register while keyboard is open
      >
        <Text style={styles.title}>Add Bike</Text>

        <Text style={styles.label}>Brand</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Honda"
          placeholderTextColor={colors.textMuted}
          value={brand}
          onChangeText={setBrand}
        />

        <Text style={styles.label}>Model</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Shine"
          placeholderTextColor={colors.textMuted}
          value={model}
          onChangeText={setModel}
        />

        <Text style={styles.label}>Variant (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Disc"
          placeholderTextColor={colors.textMuted}
          value={variant}
          onChangeText={setVariant}
        />

        <Text style={styles.label}>Registration Number (optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. BR33 1234"
          placeholderTextColor={colors.textMuted}
          value={registrationNumber}
          onChangeText={setRegistrationNumber}
        />

        <Text style={styles.label}>Fuel Type</Text>
        <View style={styles.fuelRow}>
          {FUEL_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[styles.fuelChip, fuelType === type && styles.fuelChipActive]}
              onPress={() => setFuelType(type)}
            >
              <Text style={[styles.fuelChipText, fuelType === type && styles.fuelChipTextActive]}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Current KM</Text>
        <TextInput
          style={styles.input}
          placeholder="Default 0"
          placeholderTextColor={colors.textMuted}
          value={currentKm}
          onChangeText={setCurrentKm}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Service Interval (KM)</Text>
        <TextInput
          style={styles.input}
          placeholder="Default 3000"
          placeholderTextColor={colors.textMuted}
          value={serviceIntervalKm}
          onChangeText={setServiceIntervalKm}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Adding...' : 'Add Bike'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}


function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { padding: Spacing.lg, paddingBottom: Spacing.xl * 2 },
    title: {
      fontSize: Typography.size.xl,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginBottom: Spacing.xl,
    },
    label: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
      color: colors.textSecondary,
      marginBottom: Spacing.xs + 2,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    fuelRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: Spacing.sm,
      marginBottom: Spacing.lg,
    },
    fuelChip: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md + 2,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    fuelChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    fuelChipText: {
      color: colors.text,
      fontSize: Typography.size.xs + 1,
      fontWeight: Typography.weight.semibold,
    },
    fuelChipTextActive: { color: '#fff' },
    button: {
      backgroundColor: colors.primary,
      padding: Spacing.lg,
      borderRadius: Radius.sm,
      alignItems: 'center',
      marginTop: Spacing.sm,
    },
    buttonText: {
      color: '#fff',
      fontWeight: Typography.weight.semibold,
      fontSize: Typography.size.md,
    },
  });
}