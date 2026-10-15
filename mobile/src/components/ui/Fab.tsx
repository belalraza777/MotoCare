
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Plus } from 'lucide-react-native';

import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, ThemeColors, Typography } from '../../constants/theme';

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
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={text === '+' ? 'Add' : text}
      accessibilityHint="Tap to add a new item"
      hitSlop={8}
      style={({ pressed }) => [
        styles.fab,
        pressed && styles.fabPressed,
      ]}
    >
      <View style={styles.iconBubble}>
        <Plus color={colors.surface} size={23} strokeWidth={2.6} />
      </View>
      {text !== '+' && <Text style={styles.text}>{text}</Text>}
    </Pressable>
  );
}

function createStyles(
  colors: ThemeColors,
  bottomOffset: number
) {
  return StyleSheet.create({
    fab: {
      position: 'absolute',
      bottom: Spacing.lg + 12 + bottomOffset,
      right: Spacing.lg,
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.primary,
      borderWidth: 3,
      borderColor: colors.primarySoft,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 7,
      shadowColor: colors.text,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.24,
      shadowRadius: 7,
    },
    fabPressed: {
      opacity: 0.86,
      transform: [{ scale: 0.94 }],
    },
    iconBubble: {
      width: 34,
      height: 34,
      borderRadius: Radius.lg,
      backgroundColor: 'rgba(255, 255, 255, 0.14)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: colors.surface,
      fontSize: Typography.size.xs,
      fontWeight: Typography.weight.bold,
      marginTop: 1,
    },
  });
}
