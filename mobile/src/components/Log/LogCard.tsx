import { memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Fuel, Settings, Wrench, Bike } from 'lucide-react-native';
import { LogItem } from '../../types/log.types';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

const formatType = (value: string) => value.replace(/_/g, ' ').toLowerCase();

interface LogCardProps {
  item: LogItem;
  onPress: (item: LogItem) => void;
}

export const LogCard = memo(function LogCard({ item, onPress }: LogCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  let Icon = Wrench;
  let title = '';
  let subtitle = '';

  if (item.kind === 'FUEL') {
    Icon = Fuel;
    title = `${item.litres} L fuel`;
    subtitle = 'Fuel refill';
  } else if (item.kind === 'SERVICE') {
    Icon = Settings;
    title = item.workshop || 'Service visit';
    subtitle = `${item.items.length} service item${item.items.length === 1 ? '' : 's'}`;
  } else {
    Icon = Wrench;
    title = `${formatType(item.maintenanceType)}${item.brand ? ` • ${item.brand}` : ''}`;
    subtitle = item.serviceId ? 'Included in service' : 'Maintenance';
  }

  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.85}>
      {/* Full-width bike name header — can never be overlapped */}
      <View style={styles.bikeRow}>
        <Bike size={13} color={colors.primary} strokeWidth={2.5} />
        <Text style={styles.bikeText} numberOfLines={1} ellipsizeMode="tail">
          {item.bikeName}
        </Text>
      </View>

      {/* Body: icon | info | amount */}
      <View style={styles.body}>
        <View style={styles.iconWrap}>
          <Icon size={20} color={colors.primary} strokeWidth={2.2} />
        </View>

        <View style={styles.info}>
          <Text style={styles.title} numberOfLines={1}>
            {title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
          <Text style={styles.metaText} numberOfLines={1}>
            {formatDate(item.date)}
          </Text>
          {item.kind === 'SERVICE' && item.items.length ? (
            <Text style={styles.detail} numberOfLines={1}>
              {item.items.map(formatType).join('  ·  ')}
            </Text>
          ) : null}
        </View>

        <View style={styles.amountWrap}>
          <Text style={styles.amount} numberOfLines={1}>
            ₹{item.amount.toLocaleString('en-IN')}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
});

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      paddingVertical: Spacing.md,
      paddingHorizontal: Spacing.md,
      marginBottom: Spacing.sm,
      borderWidth: 1,
      borderColor: colors.border,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
      shadowColor: colors.text,
      shadowOpacity: 0.05,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 3 },
      elevation: 2,
    },

    // ---- Bike header (full width) ----
    bikeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: Spacing.sm,
    },
    bikeText: {
      flex: 1,
      fontSize: Typography.size.xs + 1,
      fontWeight: Typography.weight.bold,
      color: colors.primary,
      letterSpacing: 0.5,
      textTransform: 'uppercase',
      marginLeft: 5,
    },

    // ---- Body row ----
    body: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    iconWrap: {
      width: 42,
      height: 42,
      borderRadius: Radius.md,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: Spacing.md,
    },
    info: {
      flex: 1,
      minWidth: 0,
    },
    title: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      textTransform: 'capitalize',
      letterSpacing: 0.1,
    },
    subtitle: {
      fontSize: Typography.size.xs + 1,
      fontWeight: Typography.weight.medium,
      color: colors.textSecondary,
      textTransform: 'capitalize',
      marginTop: 3,
    },
    metaText: {
      fontSize: Typography.size.xs,
      color: colors.textMuted,
      marginTop: 4,
    },
    detail: {
      fontSize: Typography.size.xs + 1,
      color: colors.textMuted,
      textTransform: 'capitalize',
      marginTop: 6,
    },

    amountWrap: {
      marginLeft: Spacing.sm,
      paddingTop: 2,
      alignItems: 'flex-end',
      justifyContent: 'flex-start',
    },
    amount: {
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
      color: colors.primary,
      letterSpacing: 0.2,
    },
  });
}