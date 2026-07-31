import { useEffect } from 'react';

type Theme = 'dark';

export function useTheme() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
    document.documentElement.style.colorScheme = 'dark';

    try {
      localStorage.setItem('theme', 'dark');
    } catch {
      // Local storage can be unavailable in restrictive browser modes.
    }
  }, []);

  return {
    theme: 'dark' as Theme,
    toggleTheme: () => {},
  };
}
