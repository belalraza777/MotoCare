import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Fuel } from '../../types/fuel.types';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

interface FuelCardProps {
  item: Fuel;
  onPress: () => void;
}

export function FuelCard({ item, onPress }: FuelCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  // shows cost per litre inline — a small derived stat, not stored
  const perLitre = (item.totalAmount / item.litres).toFixed(2);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.litres}>⛽ {item.litres} L</Text>
        <Text style={styles.amount}>₹{item.totalAmount}</Text>
      </View>
      <View style={styles.meta}>
        <Text style={styles.metaText}>{new Date(item.date).toLocaleDateString()}</Text>
        <Text style={styles.metaText}>•</Text>
        <Text style={styles.metaText}>₹{perLitre}/L</Text>
      </View>
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
    litres: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: colors.text },
    amount: { fontSize: Typography.size.md, fontWeight: Typography.weight.semibold, color: colors.primary },
    meta: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
    metaText: { fontSize: Typography.size.xs + 1, color: colors.textMuted },
  });
}