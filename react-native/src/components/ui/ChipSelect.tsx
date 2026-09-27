import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

interface ChipSelectProps<T extends string> {
  label: string;
  options: T[];
  value: T;
  onChange: (value: T) => void;
  formatLabel?: (value: T) => string; // optional custom display text (e.g. "ENGINE_OIL" -> "engine oil")
}

// Generic single-select chip row — reused for Fuel Type (Bike form) and
// Maintenance Type (Maintenance form) so neither screen redefines its own
// chip styling/selection logic.
export function ChipSelect<T extends string>({
  label,
  options,
  value,
  onChange,
  formatLabel = (v) => v,
}: ChipSelectProps<T>) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {options.map((option) => {
          const active = option === value;
          return (
            <TouchableOpacity
              key={option}
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => onChange(option)}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {formatLabel(option)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrapper: { marginBottom: Spacing.lg },
    label: {
      fontSize: Typography.size.sm,
      fontWeight: Typography.weight.semibold,
      color: colors.textSecondary,
      marginBottom: Spacing.xs + 2,
    },
    row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
    chip: {
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      borderRadius: Radius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
    },
    chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
    chipText: {
      color: colors.text,
      fontSize: Typography.size.xs + 1,
      fontWeight: Typography.weight.semibold,
      textTransform: 'capitalize',
    },
    chipTextActive: { color: '#fff' },
  });
}