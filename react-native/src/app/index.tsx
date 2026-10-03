import { useEffect, useRef } from 'react';
import { useAuth } from '@clerk/clerk-expo';
import { Redirect } from 'expo-router';
import { Animated, Image, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';

export default function Index() {
  const { isLoaded, isSignedIn } = useAuth();
  const { colors } = useTheme();

  // simple fade + scale in for the logo while Clerk resolves the session
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.85)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, useNativeDriver: true }),
    ]).start();
  }, []);

  if (!isLoaded) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <Animated.Image
          source={require('../../assets/motocarelogo.png')}
          style={[styles.logo, { opacity, transform: [{ scale }] }]}
          resizeMode="contain"
        />
      </SafeAreaView>
    );
  }

  return isSignedIn ? <Redirect href="/(tabs)/garage" /> : <Redirect href="/(auth)/sign-in" />;
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  logo: { width: 120, height: 120 },
});