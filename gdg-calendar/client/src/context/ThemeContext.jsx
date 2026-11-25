import { useCallback, useEffect, useState } from 'react';
import { ThemeContext } from './themeContext.js';

const THEME_KEY = 'gdg_theme_preference';

function resolveEffectiveTheme(preference) {
  if (preference === 'dark' || preference === 'light') {
    return preference;
  }
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function ThemeProvider({ children }) {
  const [preference, setPreferenceState] = useState(
    () => localStorage.getItem(THEME_KEY) || 'system'
  );
  const [effectiveTheme, setEffectiveTheme] = useState(() =>
    resolveEffectiveTheme(localStorage.getItem(THEME_KEY) || 'system')
  );

  const applyTheme = useCallback((pref) => {
    const resolved = resolveEffectiveTheme(pref);
    setEffectiveTheme(resolved);
    const root = document.documentElement;
    if (resolved === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    applyTheme(preference);
    if (preference !== 'system' || !window.matchMedia) return undefined;

    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => applyTheme('system');
    media.addEventListener('change', onChange);
    return () => media.removeEventListener('change', onChange);
  }, [preference, applyTheme]);

  const setTheme = useCallback((nextPref) => {
    localStorage.setItem(THEME_KEY, nextPref);
    setPreferenceState(nextPref);
  }, []);

  const toggleTheme = useCallback(() => {
    const next = effectiveTheme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  }, [effectiveTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme: effectiveTheme,
        preference,
        isDark: effectiveTheme === 'dark',
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

