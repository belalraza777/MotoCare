import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';

import { ThemeProvider } from '../context/ThemeContext';
import { registerForNotificationsAsync } from '../lib/notifications';

const publishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

export default function RootLayout() {
  useEffect(() => {
    registerForNotificationsAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <ClerkProvider
        publishableKey={publishableKey}
        tokenCache={tokenCache}
      >
        <ThemeProvider>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: 'default',
            }}
          />
        </ThemeProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}