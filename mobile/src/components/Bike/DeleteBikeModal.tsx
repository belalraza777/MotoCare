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
import { Button } from '../ui/Button';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

interface DeleteBikeModalProps {
  visible: boolean;
  bikeName: string;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteBikeModal({
  visible,
  bikeName,
  loading,
  error,
  onClose,
  onConfirm,
}: DeleteBikeModalProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const [typed, setTyped] = useState('');

  useEffect(() => {
    if (visible) setTyped('');
  }, [visible]);

  const matches = typed.trim().toLowerCase() === bikeName.trim().toLowerCase();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={StyleSheet.absoluteFill} onPress={loading ? undefined : onClose} />

        <View style={styles.card}>
          <Text style={styles.title}>Delete this bike?</Text>
          <Text style={styles.body}>
            This bike&apos;s maintenance, service, fuel, and document records will be permanently
            deleted and cannot be recovered.
          </Text>

          <Text style={styles.prompt}>
            Type <Text style={styles.name}>{bikeName}</Text> to confirm
          </Text>

          <TextInput
            style={styles.input}
            value={typed}
            onChangeText={setTyped}
            placeholder={bikeName}
            placeholderTextColor={colors.textMuted}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.actions}>
            <View style={styles.actionBtn}>
              <Button label="Cancel" variant="outline" onPress={onClose} disabled={loading} />
            </View>
            <View style={styles.actionBtn}>
              <Button
                label="Delete"
                variant="danger"
                onPress={onConfirm}
                loading={loading}
                disabled={!matches}
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
    overlay: {
      flex: 1,
      justifyContent: 'center',
      padding: Spacing.lg,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    card: {
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.border,
    },
    title: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      color: colors.error,
    },
    body: {
      fontSize: Typography.size.sm,
      color: colors.textSecondary,
      marginTop: Spacing.sm,
      lineHeight: 20,
    },
    prompt: {
      fontSize: Typography.size.sm,
      color: colors.text,
      marginTop: Spacing.lg,
      marginBottom: Spacing.sm,
    },
    name: { fontWeight: Typography.weight.bold },
    input: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: Radius.sm,
      padding: Spacing.md,
      fontSize: Typography.size.md,
      color: colors.text,
      backgroundColor: colors.surface,
    },
    error: { color: colors.error, fontSize: Typography.size.sm, marginTop: Spacing.sm },
    actions: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.lg },
    actionBtn: { flex: 1 },
  });
}
