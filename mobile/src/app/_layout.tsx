import { ClerkProvider } from '@clerk/clerk-expo';
import { tokenCache } from '@clerk/clerk-expo/token-cache';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ThemeProvider, useTheme } from '../context/ThemeContext';
import { registerForNotificationsAsync } from '../lib/notifications';


// The publishable key for Clerk is retrieved from environment variables.
const publishableKey =
  process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

// AppContent component handles the main content of the app, including the status bar and navigation stack.
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

// RootLayout component is the main layout for the app, wrapping the content with necessary providers and handling notifications.
export default function RootLayout() {

  // Register for push notifications when the component mounts.
  // useEffect(() => {
  //   registerForNotificationsAsync();
  // }, []);

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