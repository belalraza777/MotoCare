// src/hooks/useThemedStyles.ts
import { useMemo } from 'react';
import { useTheme } from '../context/ThemeContext';
import { ThemeColors } from '../constants/theme';

export function useThemedStyles<T>(factory: (colors: ThemeColors) => T): T {
  const { colors } = useTheme();
  return useMemo(() => factory(colors), [colors]);
}