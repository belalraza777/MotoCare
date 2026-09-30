
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { useTheme } from '../../context/ThemeContext';
import { Spacing, ThemeColors } from '../../constants/theme';

interface FabProps {
  onPress: () => void;
  bottomOffset?: number;
  text?: string;
}

export function Fab({
  onPress,
  bottomOffset = 0,
  text = '+',
}: FabProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors, bottomOffset);

  return (
    <TouchableOpacity
      style={styles.fab}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Text style={styles.text}>{text}</Text>
    </TouchableOpacity>
  );
}

function createStyles(
  colors: ThemeColors,
  bottomOffset: number
) {
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

    text: {
      color: '#fff',
      fontSize: 28,
      lineHeight: 30,
      fontWeight: '400',
    },
  });
}

