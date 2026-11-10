import { createContext, useContext } from 'react';

export const COLOR_MODE_KEY = 'color_mode';

export const ColorModeContext = createContext({
  mode: 'light',
  toggleColorMode: () => {},
});

export const useColorMode = () => useContext(ColorModeContext);

// Saved choice first; otherwise follow the system preference. Storage may be unavailable.
export function getInitialMode() {
  try {
    const saved = localStorage.getItem(COLOR_MODE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    // ignore storage errors
  }
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}
