import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Service } from '../../types/service.types';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

interface ServiceCardProps {
  item: Service;
  onPress: () => void;
}

export function ServiceCard({ item, onPress }: ServiceCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.row}>
        <Text style={styles.workshop}>{item.workshop || 'Service Visit'}</Text>
        <Text style={styles.cost}>₹{item.totalCost}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.metaText}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.metaText}>•</Text>
        <Text style={styles.metaText}>{item.odometer.toLocaleString()} km</Text>
      </View>
      {/* shows what was done, comma separated, so the list is scannable without opening each card */}
      <Text style={styles.items} numberOfLines={2}>
        {item.maintenanceIds.map((m) => m.type.replace(/_/g, ' ')).join(', ')}
      </Text>
    </TouchableOpacity>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    workshop: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: colors.text },
    cost: { fontSize: Typography.size.md, fontWeight: Typography.weight.semibold, color: colors.primary },
    meta: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.xs },
    metaText: { fontSize: Typography.size.xs + 1, color: colors.textMuted },
    items: {
      fontSize: Typography.size.sm,
      color: colors.textSecondary,
      marginTop: Spacing.sm,
      textTransform: 'capitalize',
    },
  });
}