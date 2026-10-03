
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X } from 'lucide-react-native';

import { Button } from '../ui/Button';
import { ChipSelect } from '../ui/ChipSelect';
import { TextField } from '../ui/TextField';

import { useTheme } from '../../context/ThemeContext';
import {
  Radius,
  Spacing,
  ThemeColors,
  Typography,
} from '../../constants/theme';
import { MaintenanceType } from '../../types/maintenance.types';
import {
  CreateServiceInput,
  MaintenanceItemInput,
} from '../../types/service.types';

// Available maintenance items for a typical bike service visit.
const MAINTENANCE_TYPES: MaintenanceType[] = [
  'ENGINE_OIL',
  'OIL_FILTER',
  'AIR_FILTER',
  'BRAKES',
  'TYRE',
  'BATTERY',
  'SPARK_PLUG',
  'GEAR_OIL',
  'COOLANT',
  'CHAIN',
  'CHAIN_LUBRICATION',
  'CLUTCH',
  'GENERAL_CHECK',
  'OTHER',
];

interface ServiceFormProps {
  onSubmit: (data: CreateServiceInput) => Promise<void>;
  loading: boolean;
}

// Convert values like ENGINE_OIL into readable text.
const formatMaintenanceType = (type: MaintenanceType | string) =>
  type.replace(/_/g, ' ');


export function ServiceForm({ onSubmit, loading }: ServiceFormProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // Form state for the service visit.
  const [odometer, setOdometer] = useState('');
  const [workshop, setWorkshop] = useState('');
  const [notes, setNotes] = useState('');
  const [serviceCharge, setServiceCharge] = useState('');

  // List of maintenance items added for this service visit.
  const [items, setItems] = useState<MaintenanceItemInput[]>([]);
  const [itemType, setItemType] = useState<MaintenanceType>('ENGINE_OIL');
  const [itemCost, setItemCost] = useState('');
  const [itemBrand, setItemBrand] = useState('');

  // Add the current maintenance item and reset its cost.
  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        type: itemType,
        brand: itemBrand.trim() || undefined,
        cost: itemCost ? Number(itemCost) : 0,
      },
    ]);

    setItemCost('');
    setItemBrand('');
  };

  // Remove an item before saving the service visit.
  const removeItem = (index: number) => {
    setItems((current) => current.filter((_, i) => i !== index));
  };

  // Build the API payload from the form values.
  const handleSubmit = () => {
    onSubmit({
      date: new Date().toISOString(),
      odometer: Number(odometer),
      workshop: workshop.trim() || undefined,
      notes: notes.trim() || undefined,
      serviceCharge: serviceCharge ? Number(serviceCharge) : 0,
      maintenanceItems: items,
    });
  };

  // Total cost of all maintenance items and Service Charge in this visit.
  const maintenancePartCost = items.reduce(
    (total, item) => total + (item.cost ?? 0),
    0
  );
  const totalCost = maintenancePartCost + (serviceCharge ? Number(serviceCharge) : 0);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Add Service Visit</Text>
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
            label="Workshop (optional)"
            placeholder="e.g. ABC Motors"
            value={workshop}
            onChangeText={setWorkshop}
          />

          <TextField
            label="Odometer (km)"
            placeholder="e.g. 8500"
            value={odometer}
            onChangeText={setOdometer}
            keyboardType="numeric"
          />

          <View style={styles.itemBuilder}>
            <Text style={styles.sectionLabel}>
              Add Maintenance Item
            </Text>

            <ChipSelect
              label=""
              options={MAINTENANCE_TYPES}
              value={itemType}
              onChange={setItemType}
              formatLabel={formatMaintenanceType}
            />

            <TextField
              label="Brand (optional)"
              placeholder="e.g. Castrol"
              value={itemBrand}
              onChangeText={setItemBrand}
            />

            <View style={styles.itemRow}>
              <View style={styles.costField}>
                <TextField
                  label="Cost (₹)"
                  placeholder="e.g. 650"
                  value={itemCost}
                  onChangeText={setItemCost}
                  keyboardType="numeric"
                />
              </View>

              <TouchableOpacity
                style={styles.addItemButton}
                onPress={addItem}
                activeOpacity={0.7}
              >
                <Text style={styles.addItemButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>

          {items.length > 0 && (
            <View style={styles.itemsList}>
              <Text style={styles.sectionLabel}>Items in this visit</Text>

              {items.map((item, index) => (
                <View key={index} style={styles.itemChip}>
                  <Text style={styles.itemChipText}>
                    {formatMaintenanceType(item.type)}
                    {item.brand ? ` (${item.brand})` : ''} — ₹{item.cost ?? 0}
                  </Text>

                  <TouchableOpacity onPress={() => removeItem(index)} activeOpacity={0.7}>
                    <X color={colors.error} size={18} strokeWidth={2.2} />
                  </TouchableOpacity>
                </View>
              ))}

              <Text style={styles.maintenanceTotal}>
                Maintenance: ₹{maintenancePartCost}
              </Text>

              <TextField
                label="Service Charge (₹)"
                placeholder="e.g. 300"
                value={serviceCharge}
                onChangeText={setServiceCharge}
                keyboardType="numeric"
              />

              <Text style={styles.totalText}>
                Total: ₹{totalCost}
              </Text>
            </View>
          )}

          <TextField
            label="Notes (optional)"
            placeholder="Any details..."
            value={notes}
            onChangeText={setNotes}
            multiline
            style={styles.notesInput}
          />

          <Button
            label={loading ? 'Saving...' : 'Save Service Visit'}
            onPress={handleSubmit}
            loading={loading}
            disabled={items.length === 0 || !odometer}
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
    },

    itemBuilder: {
      backgroundColor: colors.card,
      borderRadius: Radius.md,
      padding: Spacing.md,
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },

    sectionLabel: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
      color: colors.textSecondary,
      marginBottom: Spacing.sm,
    },

    itemRow: {
      flexDirection: 'row',
      gap: Spacing.sm,
      alignItems: 'flex-end',
    },

    costField: {
      flex: 1,
    },

    addItemButton: {
      backgroundColor: colors.primary,
      paddingHorizontal: Spacing.lg,
      paddingVertical: Spacing.md,
      borderRadius: Radius.sm,
      marginBottom: Spacing.md,
    },

    addItemButtonText: {
      color: '#fff',
      fontWeight: Typography.weight.semibold,
    },

    itemsList: {
      marginBottom: Spacing.md,
    },

    itemChip: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: Radius.sm,
      padding: Spacing.sm,
      marginBottom: Spacing.xs + 2,
      borderWidth: 1,
      borderColor: colors.border,
    },

    itemChipText: {
      fontSize: Typography.size.sm,
      color: colors.text,
      textTransform: 'capitalize',
    },

    removeText: {
      color: colors.error,
      fontWeight: Typography.weight.bold,
      paddingHorizontal: Spacing.xs,
    },

    totalText: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
      color: colors.primary,
      textAlign: 'right',
      marginTop: Spacing.xs,
    },
    
    maintenanceTotal: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
      color: colors.textSecondary,
      textAlign: 'right',
      marginTop: Spacing.xs,
      marginBottom: Spacing.sm,
    },

    notesInput: {
      height: 80,
      textAlignVertical: 'top',
    },
  });
}
