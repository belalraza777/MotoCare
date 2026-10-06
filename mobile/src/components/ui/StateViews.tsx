import { View, Text, StyleSheet } from 'react-native';
import { AlertCircle, Inbox, LoaderCircle } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Typography, ThemeColors } from '../../constants/theme';
import { Button } from './Button';

// Covers the three states every list/detail screen needs (loading, error,
// empty) so screens don't each write their own version of this JSX.
export function LoadingView() {
  const { colors } = useTheme();
  return (
    <View style={styles(colors).center}>
      <LoaderCircle color={colors.primary} size={24} strokeWidth={2.2} />
      <Text style={styles(colors).stateText}>Loading...</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const { colors } = useTheme();
  const s = styles(colors);
  return (
    <View style={s.center}>
      <AlertCircle color={colors.error} size={24} strokeWidth={2.2} />
      <Text style={s.errorText}>{message}</Text>
      {onRetry ? (
        <View style={{ marginTop: Spacing.md, width: '60%' }}>
          <Button label="Retry" onPress={onRetry} variant="outline" />
        </View>
      ) : null}
    </View>
  );
}

export function EmptyView({ title, subtitle }: { title: string; subtitle?: string }) {
  const { colors } = useTheme();
  const s = styles(colors);
  return (
    <View style={s.emptyWrap}>
      <Inbox color={colors.primary} size={28} strokeWidth={2.2} />
      <Text style={s.emptyTitle}>{title}</Text>
      {subtitle ? <Text style={s.emptySubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = (colors: ThemeColors) =>
  StyleSheet.create({
    center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg },
    stateText: { color: colors.textSecondary, marginTop: Spacing.sm, fontSize: Typography.size.sm },
    errorText: { color: colors.error, textAlign: 'center', fontSize: Typography.size.md, marginTop: Spacing.sm },
    emptyWrap: { alignItems: 'center', justifyContent: 'center', padding: Spacing.xl, minHeight: 180 },
    emptyTitle: { fontSize: Typography.size.lg, fontWeight: Typography.weight.semibold, color: colors.text },
    emptySubtitle: { fontSize: Typography.size.sm, color: colors.textMuted, marginTop: Spacing.xs, textAlign: 'center' },
  });