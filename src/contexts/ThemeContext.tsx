import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ThemeContextType {
  isDayMode: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [isDayMode, setIsDayMode] = useState(false); // Start with night mode (black background)

  const toggleTheme = () => {
    setIsDayMode(!isDayMode);
  };

  return (
    <ThemeContext.Provider value={{ isDayMode, toggleTheme }}>
      <div className={`min-h-screen transition-all duration-500 ${
        isDayMode 
          ? 'bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200' 
          : 'bg-gradient-to-br from-gray-900 via-slate-900 to-black'
      }`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}