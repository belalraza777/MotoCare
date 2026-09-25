import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth, useUser } from '@clerk/clerk-expo';
import { useTheme } from '../../context/ThemeContext';
import { Radius, Spacing, Typography, ThemeColors } from '../../constants/theme';

export default function ProfileScreen() {
  const { signOut } = useAuth();
  const { user } = useUser();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      {/* Shows whichever identifier Clerk has on file — works for both
          email/password and Google sign-in users */}
      <Text style={styles.text}>{user?.primaryEmailAddress?.emailAddress}</Text>

      {/* Sign-out redirect is handled automatically by (auth)/(tabs) layout
          guards once isSignedIn flips to false — no manual navigation needed */}
      <TouchableOpacity style={styles.button} onPress={() => signOut()}>
        <Text style={styles.buttonText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: Spacing.lg,
      gap: Spacing.lg,
      backgroundColor: colors.background,
    },
    text: {
      fontSize: Typography.size.md,
      color: colors.text,
    },
    button: {
      backgroundColor: colors.error,
      paddingVertical: Spacing.md + 2,
      paddingHorizontal: Spacing.xl,
      borderRadius: Radius.sm,
    },
    buttonText: {
      color: '#fff',
      fontWeight: Typography.weight.semibold,
    },
  });
}