import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { ChevronRight, Fuel } from 'lucide-react-native';
import { SvgUri } from 'react-native-svg';
import { Bike } from '../../types/bike.types';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

const bikeIconUri = Image.resolveAssetSource(
  require('../../../assets/bikeIcon.svg')
).uri;

interface BikeCardProps {
  item: Bike;
  onPress: () => void;
}

export function BikeCard({ item, onPress }: BikeCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      {/* Icon tile stands in for a bike photo until image upload is built */}
      <View style={styles.iconTile}>
        <SvgUri uri={bikeIconUri} width={34} height={34} fill={colors.primary} />
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{item.brand} {item.model}</Text>
        {item.variant ? <Text style={styles.variant}>{item.variant}</Text> : null}
        <View style={styles.meta}>
          <Text style={styles.metaText}>{item.currentKm.toLocaleString()} km</Text>
          <Text style={styles.metaDot}>•</Text>
          <Fuel color={colors.textMuted} size={14} strokeWidth={2} />
          <Text style={styles.metaText}>{item.fuelType}</Text>
        </View>
      </View>

      <ChevronRight color={colors.textMuted} size={18} strokeWidth={2.2} />
    </TouchableOpacity>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      marginBottom: Spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    iconTile: {
      width: 52,
      height: 52,
      borderRadius: Radius.md,
      backgroundColor: colors.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: Spacing.md,
    },
    info: { flex: 1 },
    name: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: colors.text },
    variant: { fontSize: Typography.size.xs + 1, color: colors.textSecondary, marginTop: 1 },
    meta: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs + 2, marginTop: Spacing.xs },
    metaText: { fontSize: Typography.size.xs, color: colors.textMuted },
    metaDot: { fontSize: Typography.size.xs, color: colors.textMuted },

    chevron: { fontSize: 22, color: colors.textMuted, marginLeft: Spacing.sm },
  });
}