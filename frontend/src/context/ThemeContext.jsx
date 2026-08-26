import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { getStoredTheme, setStoredTheme } from '../utils/storage.js';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => getStoredTheme());

  useEffect(() => {
    const root = document.documentElement;
    const isDark = theme === 'dark';

    root.classList.toggle('dark', isDark);
    // Bootstrap is loaded for layout helpers and has its own color tokens.
    // Keep its native controls and any Bootstrap utilities in sync with our theme.
    root.dataset.bsTheme = isDark ? 'dark' : 'light';
    setStoredTheme(theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark: theme === 'dark' }}>
      {children}
    </ThemeContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
