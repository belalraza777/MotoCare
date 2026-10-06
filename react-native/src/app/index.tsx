import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { Animated, Image, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { Spacing, Typography, ThemeColors } from '../constants/theme';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.85)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // logo fades + scales in first, text follows once the logo settles
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, { toValue: 1, duration: 600, useNativeDriver: true }),
        Animated.spring(logoScale, { toValue: 1, friction: 5, useNativeDriver: true }),
      ]),
      Animated.timing(textOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.Image
          source={require('../../assets/motocarelogo.png')}
          style={[styles.logo, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
          resizeMode="contain"
        />
        <Animated.View style={{ opacity: textOpacity, alignItems: 'center' }}>
          <Text style={styles.title}>MotoCare</Text>
          <Text style={styles.tagline}>Ride Better · Maintain Longer</Text>
        </Animated.View>
        <ActivityIndicator style={styles.spinner} size="small" color={colors.primary} />
      </SafeAreaView>
    );
  }

  return isSignedIn ? <Redirect href="/(tabs)/garage" /> : <Redirect href="/(auth)/sign-in" />;
}

function createStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
    logo: { width: 120, height: 120, marginBottom: Spacing.lg },
    title: {
      fontSize: Typography.size.xl,
      fontWeight: Typography.weight.bold,
      color: colors.text,
      letterSpacing: 0.5,
    },
    tagline: {
      fontSize: Typography.size.xs,
      color: colors.textMuted,
      marginTop: Spacing.xs,
      letterSpacing: 0.3,
    },
    spinner: { position: 'absolute', bottom: Spacing.xl * 2 },
  });
}