import { View, Text, StyleSheet } from 'react-native';
import { DocumentStatus } from '../../types/document.types';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

const STATUS_LABEL: Record<DocumentStatus, string> = {
  valid: 'Valid',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
};

export function StatusBadge({ status }: { status: DocumentStatus }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const color = status === 'valid' ? colors.success : status === 'expiring_soon' ? colors.warning : colors.error;

  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.text, { color }]}>{STATUS_LABEL[status]}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    badge: { paddingHorizontal: Spacing.sm + 2, paddingVertical: 4, borderRadius: Radius.xl, alignSelf: 'flex-start' },
    text: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold },
  });
}