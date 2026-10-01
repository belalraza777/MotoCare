import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Document } from '../../types/document.types';
import { StatusBadge } from '../ui/StatusBadge';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

interface DocumentCardProps {
  item: Document;
  onPress: () => void;
}

export function DocumentCard({ item, onPress }: DocumentCardProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const title =
    item.type === 'INSURANCE' ? item.company || 'Insurance' :
    item.type === 'PUC' ? 'PUC Certificate' :
    item.type === 'RC' ? 'Registration Certificate' :
    item.title || 'Document';

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.row}>
        <Text style={styles.title}>{title}</Text>
        <StatusBadge status={item.status} />
      </View>
      <Text style={styles.expiry}>Expires {new Date(item.expiryDate).toLocaleDateString()}</Text>
    </TouchableOpacity>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    card: { backgroundColor: colors.card, borderRadius: Radius.lg, padding: Spacing.lg, marginBottom: Spacing.md, borderWidth: 1, borderColor: colors.border },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    title: { fontSize: Typography.size.md, fontWeight: Typography.weight.bold, color: colors.text },
    expiry: { fontSize: Typography.size.sm, color: colors.textMuted, marginTop: Spacing.xs },
  });
}