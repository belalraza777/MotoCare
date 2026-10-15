import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { registerForNotificationsAsync } from '../lib/notifications';

// Load the Clerk key from the environment variables.
const publishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// Sets up the status bar and navigation using the current theme.
function AppContent() {
  const { isDark } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'default',
        }}
      />
    </>
  );
}

// Sets up the providers required by the entire app.
export default function RootLayout() {
  // Register for notification permissions when the app layout mounts.
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
          <AppContent />
        </ThemeProvider>
      </ClerkProvider>
    </SafeAreaProvider>
  );
}