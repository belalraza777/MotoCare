import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AlertTriangle, Gauge } from 'lucide-react-native';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

interface UpdateKmModalProps {
  visible: boolean;
  currentKm: number;
  loading: boolean;
  serverError: string | null;
  onClose: () => void;
  onSubmit: (km: number) => void;
}

export function UpdateKmModal({
  visible,
  currentKm,
  loading,
  serverError,
  onClose,
  onSubmit,
}: UpdateKmModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const [value, setValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      setValue(String(currentKm));
      setLocalError(null);
    }
  }, [visible, currentKm]);

  const handleSave = () => {
    const km = Number(value);
    if (value.trim() === '' || !Number.isInteger(km)) {
      return setLocalError('Enter a whole number.');
    }
    if (km < currentKm) {
      return setLocalError(`Can't be lower than ${currentKm.toLocaleString()} km.`);
    }
    if (km === currentKm) return onClose();
    setLocalError(null);
    onSubmit(km);
  };

  const error = localError ?? serverError;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.iconWrap}>
              <Gauge size={22} color={colors.primary} strokeWidth={2.2} />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.title}>Update odometer</Text>
              <Text style={styles.hint}>Keep your bike mileage up to date</Text>
            </View>
          </View>

          <View style={styles.currentCard}>
            <Text style={styles.currentLabel}>CURRENT READING</Text>
            <Text style={styles.currentValue}>{currentKm.toLocaleString()} km</Text>
          </View>

          <View style={styles.warning}>
            <AlertTriangle size={17} color={colors.warning} strokeWidth={2.2} />
            <Text style={styles.warningText}>
              Set this carefully. The odometer value cannot be lowered later.
            </Text>
          </View>

          <Text style={styles.inputLabel}>New odometer reading</Text>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={setValue}
            keyboardType="number-pad"
            placeholder="e.g. 8500"
            placeholderTextColor={colors.textMuted}
            autoFocus
            selectTextOnFocus
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <View style={styles.actionBtn}>
              <Button label="Cancel" variant="outline" onPress={onClose} disabled={loading} />
            </View>
            <View style={styles.actionBtn}>
              <Button label="Save" onPress={handleSave} loading={loading} />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      padding: Spacing.lg,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      padding: Spacing.xl,
      borderWidth: 1,
      borderColor: colors.border,
    },
    header: { flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: Radius.md,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: { flex: 1, marginLeft: Spacing.md },
    title: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      color: colors.text,
    },
    hint: {
      fontSize: Typography.size.sm,
      color: colors.textMuted,
      marginTop: 3,
    },
    currentCard: {
      backgroundColor: colors.surface,
      borderRadius: Radius.md,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: Spacing.md,
    },
    currentLabel: {
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.semibold,
      color: colors.textMuted,
      letterSpacing: 0.8,
    },
    currentValue: {
      fontSize: Typography.size.xl,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      marginTop: 3,
    },
    warning: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.primarySoft,
      borderRadius: Radius.sm,
      padding: Spacing.sm,
      marginBottom: Spacing.md,
    },
    warningText: { flex: 1, fontSize: Typography.size.sm, color: colors.text, marginLeft: Spacing.sm, lineHeight: 20 },
    inputLabel: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
      color: colors.text,
      marginBottom: Spacing.sm,
    },
    input: {
      borderWidth: 1,
      borderColor: colors.primary,
      borderRadius: Radius.md,
      paddingHorizontal: Spacing.md,
      paddingVertical: Spacing.md + 2,
      fontSize: Typography.size.xl,
      fontWeight: Typography.weight.semibold,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    error: { color: colors.error, fontSize: Typography.size.sm, marginTop: Spacing.sm },
    actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
    actionBtn: { flex: 1 },
  });
}
