import { useEffect, useState } from 'react';
import { Modal, View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

const MAX_KM = 999999;
const BIG_JUMP = 5000;

interface UpdateKmModalProps {
  visible: boolean;
  currentKm: number;
  loading: boolean;
  serverError: string | null;
  onClose: () => void;
  onSubmit: (km: number) => void;
}

export function UpdateKmModal({ visible, currentKm, loading, serverError, onClose, onSubmit }: UpdateKmModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [value, setValue] = useState(''); // State to hold the input value as a string
  const [armed, setArmed] = useState(false); // State to track if the user has confirmed a risky update

  useEffect(() => {
    if (visible) {
      setValue(String(currentKm));
      setArmed(false);
    }
  }, [visible, currentKm]);

  const onChange = (text: string) => {
    setValue(text.replace(/[^0-9]/g, ''));
    setArmed(false);
  };

  const hasValue = value !== ''; // Check if the input has a value
  const km = Number(value); // Convert the input value to a number
  const diff = km - currentKm; // Calculate the difference between the new value and the current value
  const tooBig = hasValue && km > MAX_KM; // Check if the new value exceeds the maximum allowed value
  const risky = hasValue && !tooBig && (diff < 0 || diff > BIG_JUMP); // Check if the new value is risky (either lower than current or a big jump)

  let preview = ''; // Initialize the preview message
  if (hasValue && !tooBig) {
    if (diff === 0) preview = 'No change';
    else if (diff > 0 && diff <= BIG_JUMP) preview = `+${diff.toLocaleString()} km`;
    else if (diff > BIG_JUMP) preview = `+${diff.toLocaleString()} km at once. Please double-check this value.`;
    else preview = `${Math.abs(diff).toLocaleString()} km LOWER. Use this only to correct a mistake.`;
  }

  const handleSave = () => {
    if (!hasValue || tooBig) return;
    if (diff === 0) return onClose();
    if (risky && !armed) return setArmed(true);
    onSubmit(km);
  };

  const error = serverError ?? (tooBig ? `Max ${MAX_KM.toLocaleString()} km` : null);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <Pressable style={StyleSheet.absoluteFill} onPress={loading ? undefined : onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Update odometer</Text>
          <Text style={styles.hint}>Current: {currentKm.toLocaleString()} km</Text>

          <View style={styles.caution}>
            <AlertTriangle size={16} color={colors.warning} strokeWidth={2.4} />
            <Text style={styles.cautionText}>
              Enter carefully. An incorrect KM reading can make service due dates and reminders inaccurate.
            </Text>
          </View>

          <TextInput
            style={[styles.input, risky && styles.inputRisky]}
            value={value}
            onChangeText={onChange}
            keyboardType="number-pad"
            placeholder="e.g. 8500"
            placeholderTextColor={colors.textMuted}
            autoFocus
            selectTextOnFocus
            editable={!loading}
          />

          {preview ? <Text style={[styles.preview, risky && styles.previewRisky]}>{preview}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <View style={styles.actionBtn}>
              <Button label="Cancel" variant="outline" onPress={onClose} disabled={loading} />
            </View>
            <View style={styles.actionBtn}>
              <Button
                label={armed ? 'Confirm update' : 'Save'}
                variant={armed ? 'danger' : 'primary'}
                onPress={handleSave}
                loading={loading}
                disabled={!hasValue || tooBig}
              />
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    overlay: { flex: 1, justifyContent: 'center', padding: Spacing.lg, backgroundColor: 'rgba(0,0,0,0.5)' },
    card: { backgroundColor: colors.card, borderRadius: Radius.lg, padding: Spacing.lg, borderWidth: 1, borderColor: colors.border },
    title: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: colors.text },
    hint: { fontSize: Typography.size.sm, color: colors.textMuted, marginTop: 2 },
    caution: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.sm,
      backgroundColor: colors.warning + '22',
      borderRadius: Radius.sm,
      padding: Spacing.sm + 2,
      marginVertical: Spacing.md,
    },
    cautionText: { flex: 1, fontSize: Typography.size.xs + 1, color: colors.text, lineHeight: 18 },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      padding: Spacing.md,
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.semibold,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    inputRisky: { borderColor: colors.warning },
    preview: { fontSize: Typography.size.sm, color: colors.textSecondary, marginTop: Spacing.sm },
    previewRisky: { color: colors.warning, fontWeight: Typography.weight.semibold },
    error: { color: colors.error, fontSize: Typography.size.sm, marginTop: Spacing.sm },
    actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
    actionBtn: { flex: 1 },
  });
}
