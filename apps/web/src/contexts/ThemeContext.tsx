import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeId } from '../types/theme';
import themes from '../themes/themes';

interface ThemeContextType {
  theme: Theme;
  themeId: ThemeId;
  setThemeId: (id: ThemeId) => void;
  availableThemes: Record<string, Theme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    const saved = localStorage.getItem('theme-id');
    return (saved as ThemeId) || 'minimal-clean';
  });

  const theme = themes[themeId];

  useEffect(() => {
    console.log('Theme changed to:', themeId);
    localStorage.setItem('theme-id', themeId);
  }, [themeId]);

  // Apply CSS custom properties to :root
  useEffect(() => {
    const root = document.documentElement;

    // Colors
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });

    // Typography
    Object.entries(theme.typography).forEach(([key, value]) => {
      root.style.setProperty(`--typography-${key}`, value);
    });

    // Spacing
    Object.entries(theme.spacing).forEach(([key, value]) => {
      root.style.setProperty(`--spacing-${key}`, value);
    });

    // Border Radius
    Object.entries(theme.borderRadius).forEach(([key, value]) => {
      root.style.setProperty(`--radius-${key}`, value);
    });

    // Shadows
    Object.entries(theme.shadows).forEach(([key, value]) => {
      root.style.setProperty(`--shadow-${key}`, value);
    });

    // Effects
    Object.entries(theme.effects).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--effect-${key}`, value);
      }
    });
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeId,
        setThemeId,
        availableThemes: themes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
