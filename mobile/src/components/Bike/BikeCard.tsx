
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronRight, Fuel, Gauge } from 'lucide-react-native';
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
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Bike identity and navigation */}
      <View style={styles.header}>
        <View style={styles.iconTile}>
          <BikeIcon width={48} height={48} fill={colors.primary} />
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {item.brand} {item.model}
          </Text>

          {item.variant ? (
            <Text style={styles.variant} numberOfLines={1}>
              {item.variant}
            </Text>
          ) : null}
        </View>

        <View style={styles.arrowButton}>
          <ChevronRight
            color={colors.primary}
            size={20}
            strokeWidth={2.2}
          />
        </View>
      </View>

      {/* Separate the bike details from its identity */}
      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailItem}>
          <View style={styles.detailIcon}>
            <Gauge size={17} color={colors.primary} strokeWidth={2} />
          </View>

          <View style={styles.detailInfo}>
            <Text style={styles.detailLabel}>ODOMETER</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item.currentKm.toLocaleString()} km
            </Text>
          </View>
        </View>

        <View style={styles.verticalDivider} />

        <View style={styles.detailItem}>
          <View style={styles.detailIcon}>
            <Fuel size={17} color={colors.primary} strokeWidth={2} />
          </View>

          <View style={styles.detailInfo}>
            <Text style={styles.detailLabel}>FUEL TYPE</Text>
            <Text style={styles.detailValue} numberOfLines={1}>
              {item.fuelType}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      padding: Spacing.lg,
      marginBottom: Spacing.md,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.06,
      shadowRadius: 8,
      elevation: 2,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    iconTile: {
      width: 72,
      height: 72,
      borderRadius: Radius.lg,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },

    info: {
      flex: 1,
      minWidth: 0,
      justifyContent: 'center',
    },

    name: {
      fontSize: Typography.size.lg,
      fontWeight: Typography.weight.bold,
      color: colors.text,
    },

    variant: {
      fontSize: Typography.size.sm,
      color: colors.textSecondary,
      marginTop: 5,
    },

    arrowButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: Spacing.sm,
    },

    divider: {
      height: StyleSheet.hairlineWidth,
      backgroundColor: colors.border,
      marginVertical: Spacing.md,
    },

    details: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    detailItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      minWidth: 0,
      gap: Spacing.sm,
    },

    detailIcon: {
      width: 34,
      height: 34,
      borderRadius: Radius.md,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },

    detailInfo: {
      flex: 1,
      minWidth: 0,
    },

    detailLabel: {
      fontSize: 10,
      fontWeight: Typography.weight.medium,
      color: colors.textMuted,
      letterSpacing: 0.6,
    },

    detailValue: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
      color: colors.text,
      marginTop: 3,
    },

    verticalDivider: {
      width: StyleSheet.hairlineWidth,
      height: 34,
      backgroundColor: colors.border,
      marginHorizontal: Spacing.md,
    },
  });
}
