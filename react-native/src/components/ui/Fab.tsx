// src/components/ui/Fab.tsx
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, ThemeColors } from '../../constants/theme';

interface FabProps {
  onPress: () => void;
  bottomOffset?: number; // pass extra offset when a tab bar is present below this screen
}

export function Fab({ onPress, bottomOffset = 0 }: FabProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors, bottomOffset);

  return (
    <TouchableOpacity style={styles.fab} onPress={onPress}>
      <Text style={styles.text}>+</Text>
    </TouchableOpacity>
  );
}

function createStyles(colors: ThemeColors, bottomOffset: number) {
  return StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: Spacing.lg + 8 + bottomOffset,
      right: Spacing.lg + 8,
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 4,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
    },
    text: { color: '#fff', fontSize: 28, lineHeight: 30 },
  });
}