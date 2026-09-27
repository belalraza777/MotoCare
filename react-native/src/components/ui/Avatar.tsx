import { View, Text, Image, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { ThemeColors } from '../../constants/theme';

interface AvatarProps {
  imageUrl?: string | null;
  name?: string | null;
  size?: number;
}

// Shows the user's photo if Clerk has one (Google sign-in users usually do),
// otherwise falls back to their initials on a colored circle.
export function Avatar({ imageUrl, name, size = 64 }: AvatarProps) {
  const { colors } = useTheme();
  const styles = createStyles(colors, size);

  if (imageUrl) {
    return <Image source={{ uri: imageUrl }} style={styles.image} />;
  }

  const initials = name
    ? name.trim().split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : '?';

  return (
    <View style={styles.fallback}>
      <Text style={styles.initials}>{initials}</Text>
    </View>
  );
}

function createStyles(colors: ThemeColors, size: number) {
  return StyleSheet.create({
    image: { width: size, height: size, borderRadius: size / 2 },
    fallback: {
      width: size,
      height: size,
      borderRadius: size / 2,
      backgroundColor: colors.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
    initials: { color: '#fff', fontSize: size / 2.5, fontWeight: '700' },
  });
}