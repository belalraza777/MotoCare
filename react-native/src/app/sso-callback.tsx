import { useEffect, useRef } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@clerk/clerk-expo';

const SIGN_IN_FALLBACK_MS = 8000;

export default function SSOCallback() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const hasNavigated = useRef(false);

  useEffect(() => {
    if (!isLoaded || hasNavigated.current) return;

    if (isSignedIn) {
      hasNavigated.current = true;
      router.replace('/(tabs)/garage');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (!isLoaded || isSignedIn || hasNavigated.current) return;

    const timeout = setTimeout(() => {
      if (hasNavigated.current) return;
      hasNavigated.current = true;
      router.replace('/(auth)/sign-in');
    }, SIGN_IN_FALLBACK_MS);

    return () => clearTimeout(timeout);
  }, [isLoaded, isSignedIn, router]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
    </View>
  );
}