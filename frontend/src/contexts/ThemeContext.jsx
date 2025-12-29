import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or default to 'light'
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved || 'light';
  });

  // Apply theme changes to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove both classes
    root.classList.remove('light', 'dark');
    
    // Add current theme
    if (theme === 'dark') {
      root.classList.add('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
    
    console.log('✅ Theme applied:', theme);
    console.log('📋 HTML classes:', root.className);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => {
      const newTheme = prevTheme === 'light' ? 'dark' : 'light';
      console.log('🔄 Toggling:', prevTheme, '→', newTheme);
      return newTheme;
    });
  };

  const value = {
    theme,
    toggleTheme,
    setTheme, // Add this for manual control
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};