import { useAuth } from '@clerk/clerk-expo';
import { Redirect, Tabs } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';
import { Bike, ClipboardList, User } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function TabsLayout() {
  const { isSignedIn, isLoaded } = useAuth();
  const { colors } = useTheme();

  if (!isLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (!isSignedIn) {
    return <Redirect href="/(auth)/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          height: 64,
          paddingTop: 6,
          paddingBottom: 6,
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="garage"
        options={{
          title: 'Garage',
          tabBarIcon: ({ color }) => (
            <Bike color={color} size={22} />
          ),
        }}
      />

      <Tabs.Screen
        name="log"
        options={{
          title: 'Logs',
          tabBarIcon: ({ color }) => (
            <ClipboardList color={color} size={22} />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <User color={color} size={22} />
          ),
        }}
      />
    </Tabs>
  );
}

