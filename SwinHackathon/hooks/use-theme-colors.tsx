import { Colors } from '@/constants/theme';
import { ThemeContext } from '@/context/themeContext';
import React, {  useContext } from 'react';
import { useColorScheme } from 'react-native';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  
  const themeValue = {
    colors: isDark ? Colors.light : Colors.light,
    isDark
  };

  return (
    <ThemeContext.Provider value={themeValue}>
      {children}
    </ThemeContext.Provider>
  );
};


export const useTheme = () => useContext(ThemeContext);
