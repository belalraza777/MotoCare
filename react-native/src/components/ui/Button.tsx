import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

type Variant = 'primary' | 'danger' | 'outline';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
}

// One button for the whole app — variant controls styling, loading shows
// a spinner instead of the label. Used for every submit/delete/retry action.
export function Button({ label, onPress, variant = 'primary', loading, disabled }: ButtonProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      style={[styles.base, styles[variant], isDisabled && styles.disabled]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? colors.primary : colors.surface} />
      ) : (
        <Text style={[styles.label, variant === 'outline' && { color: colors.primary }]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    base: { paddingVertical: Spacing.md + 2, borderRadius: Radius.sm, alignItems: 'center', justifyContent: 'center' },
    primary: { backgroundColor: colors.primary },
    danger: { backgroundColor: colors.error },
    outline: { backgroundColor: 'transparent', borderWidth: 1, borderColor: colors.primary },
    disabled: { opacity: 0.6 },
    label: { color: colors.surface, fontWeight: Typography.weight.semibold, fontSize: Typography.size.md },
  });
}