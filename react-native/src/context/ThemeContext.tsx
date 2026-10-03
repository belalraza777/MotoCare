// src/context/ThemeContext.tsx
import { createContext, useContext, useMemo, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { Colors, ThemeColors, ThemeName } from '../constants/theme';

interface ThemeContextValue {
  colors: ThemeColors;
  theme: ThemeName;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemScheme = useColorScheme();
  const systemTheme: ThemeName = systemScheme === 'dark' ? 'dark' : 'light';
  const [themeOverride, setThemeOverride] = useState<ThemeName | null>(null);
  const theme = themeOverride ?? systemTheme;

  const toggleTheme = () => {
    setThemeOverride((currentTheme) => {
      const activeTheme = currentTheme ?? systemTheme;
      return activeTheme === 'dark' ? 'light' : 'dark';
    });
  };

  const value = useMemo<ThemeContextValue>(
    () => ({
      colors: Colors[theme],
      theme,
      isDark: theme === 'dark',
      toggleTheme,
    }),
    [theme, systemTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}