import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

interface TextFieldProps extends TextInputProps {
  label: string;
}

// Label + input paired together — every form field in the app uses this
// instead of writing <Text> + <TextInput> separately on each screen.
export function TextField({ label, style, ...inputProps }: TextFieldProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, style]} placeholderTextColor={colors.textMuted} {...inputProps} />
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    wrapper: { marginBottom: Spacing.md },
    label: { fontSize: Typography.size.sm, fontWeight: Typography.weight.semibold, color: colors.textSecondary, marginBottom: Spacing.xs + 2 },
    input: { borderWidth: 1, borderColor: colors.border, borderRadius: Radius.sm, padding: Spacing.md, color: colors.text, backgroundColor: colors.surface },
  });
}