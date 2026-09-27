import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Maintenance } from '../../types/maintenance.types';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

interface MaintenanceCardProps {
  item: Maintenance;
  onPress: () => void; // navigates to edit screen
}

// One card per maintenance record — pulled out of the list screen so the
// list file stays focused on data-fetching, not row rendering.
export function MaintenanceCard({ item, onPress }: MaintenanceCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.type}>{item.type.replace(/_/g, ' ')}</Text>
        <Text style={styles.cost}>₹{item.cost}</Text>
      </View>
      {item.brand ? <Text style={styles.brand}>{item.brand}</Text> : null}
      <View style={styles.meta}>
        <Text style={styles.metaText}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.metaText}>•</Text>
        <Text style={styles.metaText}>{item.odometer.toLocaleString()} km</Text>
      </View>
      {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
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
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    type: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: colors.text, textTransform: 'capitalize' },
    cost: { fontSize: Typography.size.md, fontWeight: Typography.weight.semibold, color: colors.primary },
    brand: { fontSize: Typography.size.sm, color: colors.textSecondary, marginTop: 2 },
    meta: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
    metaText: { fontSize: Typography.size.xs + 1, color: colors.textMuted },
    notes: { fontSize: Typography.size.sm, color: colors.textSecondary, marginTop: Spacing.sm },
  });
}