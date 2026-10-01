import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

type ServiceStatus = 'normal' | 'due_soon' | 'overdue';

const LABEL: Record<ServiceStatus, string> = {
  normal: 'On Track',
  due_soon: 'Due Soon',
  overdue: 'Overdue',
};

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const color = status === 'normal' ? colors.success : status === 'due_soon' ? colors.warning : colors.error;

  return (
    <View style={[styles.badge, { backgroundColor: color + '22' }]}>
      <Text style={[styles.text, { color }]}>{LABEL[status]}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    badge: { paddingHorizontal: Spacing.sm + 2, paddingVertical: 4, borderRadius: Radius.xl, alignSelf: 'flex-start' },
    text: { fontSize: Typography.size.xs, fontWeight: Typography.weight.semibold },
  });
}