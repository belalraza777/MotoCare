import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight, Fuel } from 'lucide-react-native';
import { Bike } from '../../types/bike.types';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

import BikeIcon from '../../../assets/bikeIcon.svg';

interface BikeCardProps {
  item: Bike;
  onPress: () => void;
}

export function BikeCard({ item, onPress }: BikeCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      {/* Icon tile stands in for a bike photo until image upload is built */}
      <View style={styles.iconTile}>
        <BikeIcon width={46} height={46} fill={colors.primary} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name}>{item.brand} {item.model}</Text>
        {item.variant ? <Text style={styles.variant}>{item.variant}</Text> : null}
        <View style={styles.meta}>
          <Text style={styles.metaLabel}>Odometer</Text>
          <Text style={styles.metaText}>{item.currentKm.toLocaleString()} km</Text>
          <Text style={styles.metaDot}>•</Text>
          <Fuel color={colors.textMuted} size={14} strokeWidth={2} />
          <Text style={styles.metaText}>{item.fuelType}</Text>
        </View>
      </View>

      <View style={styles.chevronCircle}>
        <ChevronRight color={colors.primary} size={18} strokeWidth={2.4} />
      </View>
    </TouchableOpacity>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 3,
    },
    iconTile: {
      width: 72,
      height: 72,
      borderRadius: Radius.lg,
      backgroundColor: colors.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.lg,
      borderWidth: 1,
      borderColor: colors.primary + '35',
    },
    info: { flex: 1 },
    name: { fontSize: Typography.size.lg, fontWeight: Typography.weight.bold, color: colors.text },
    variant: { fontSize: Typography.size.sm, color: colors.textSecondary, marginTop: 3 },
    meta: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: Spacing.xs + 2, marginTop: Spacing.sm },
    metaLabel: { fontSize: Typography.size.xs, color: colors.textMuted },
    metaText: { fontSize: Typography.size.xs, color: colors.textSecondary, fontWeight: Typography.weight.semibold },
    metaDot: { fontSize: Typography.size.xs, color: colors.textMuted },
    chevronCircle: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primarySoft,
      marginLeft: Spacing.sm,
    },
  });
}