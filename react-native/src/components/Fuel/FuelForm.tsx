import { useState } from 'react';
import {
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TextField } from '../ui/TextField';
import { Button } from '../ui/Button';
import { Fuel, CreateFuelInput } from '../../types/fuel.types';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Typography, ThemeColors } from '../../constants/theme';

interface FuelFormProps {
  initialValue?: Fuel;
  onSubmit: (data: CreateFuelInput) => Promise<void>;
  submitLabel: string;
  loading: boolean;
}

export function FuelForm({
  initialValue,
  onSubmit,
  submitLabel,
  loading,
}: FuelFormProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [date, setDate] = useState(
    initialValue?.date
      ? initialValue.date.slice(0, 10)
      : new Date().toISOString().slice(0, 10)
  );

  const [litres, setLitres] = useState(
    initialValue?.litres?.toString() ?? ''
  );

  const [totalAmount, setTotalAmount] = useState(
    initialValue?.totalAmount?.toString() ?? ''
  );

  const handleSubmit = () => {
    onSubmit({
      date: new Date(date).toISOString(),
      litres: Number(litres),
      totalAmount: Number(totalAmount),
    });
  };

  const screenTitle = initialValue ? 'Edit Fuel Entry' : 'Add Fuel Entry';

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
        <ScrollView
          contentContainerStyle={styles.container}
          keyboardShouldPersistTaps="handled"
        >
          <TextField
            label="Date"
            placeholder="YYYY-MM-DD"
            value={date}
            onChangeText={setDate}
          />

          <TextField
            label="Litres"
            placeholder="e.g. 5.2"
            value={litres}
            onChangeText={setLitres}
            keyboardType="decimal-pad"
          />

          <TextField
            label="Total Amount (₹)"
            placeholder="e.g. 530"
            value={totalAmount}
            onChangeText={setTotalAmount}
            keyboardType="numeric"
          />

          <Button
            label={submitLabel}
            onPress={handleSubmit}
            loading={loading}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    flex: {
      flex: 1,
    },
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
      paddingBottom: Spacing.xl * 2,
      gap: Spacing.md,
    },
  });
}