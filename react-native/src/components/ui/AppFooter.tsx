import { StyleSheet, Text, View } from 'react-native';
import Constants from 'expo-constants';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

export function AppFooter() {
  const { colors } = useTheme();
  const styles = createStyles(colors);
  const appVersion = Constants.expoConfig?.version ?? '—';
  const currentYear = new Date().getFullYear();

  return (
    <View style={styles.footer}>
      <View style={styles.rule} />
      <Text style={styles.title}>MotoCare</Text>
      <Text style={styles.tagline}>Ride smarter. Maintain better.</Text>
      <View style={styles.metaRow}>
        <Text style={styles.meta}>© {currentYear} MotoCare</Text>
        <View style={styles.dot} />
        <Text style={styles.version}>v{appVersion}</Text>
      </View>
      <Text style={styles.credit}>Developed by Belal </Text>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    footer: {
      alignItems: 'center',
      paddingTop: Spacing.md,
      paddingBottom: Spacing.sm,
    },
    rule: {
      width: 42,
      height: 3,
      borderRadius: Radius.sm,
      backgroundColor: colors.primary,
      marginBottom: Spacing.md,
    },
    title: {
      color: colors.text,
      fontSize: Typography.size.md,
      fontWeight: Typography.weight.bold,
      letterSpacing: 0.5,
    },
    tagline: {
      color: colors.textSecondary,
      fontSize: Typography.size.xs + 1,
      marginTop: Spacing.xs,
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: Spacing.sm,
    },
    meta: {
      color: colors.textMuted,
      fontSize: Typography.size.xs,
    },
    dot: {
      width: 3,
      height: 3,
      borderRadius: 2,
      backgroundColor: colors.textMuted,
      marginHorizontal: Spacing.sm,
    },
    version: {
      color: colors.textMuted,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.semibold,
    },
    credit: {
      color: colors.textMuted,
      fontSize: Typography.size.xs,
      marginTop: Spacing.xs,
    },
  });
}
