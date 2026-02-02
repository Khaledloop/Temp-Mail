'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';

export function ThemeClient() {
  const { isDarkMode, setDarkMode } = useUiStore();

  const applyTheme = (isDark: boolean) => {
    const mode = isDark ? 'dark' : 'light';
    const root = document.documentElement;
    const body = document.body;
    root.dataset.theme = mode;
    body.dataset.theme = mode;
    root.classList.toggle('dark', isDark);
    body.classList.toggle('dark', isDark);
    root.style.colorScheme = isDark ? 'dark' : 'light';
    body.style.backgroundColor = isDark ? '#050505' : '';
    body.style.color = isDark ? '#f5f5f5' : '';
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = window.localStorage.getItem('theme');
    if (stored === 'dark' || stored === 'light') {
      const isDark = stored === 'dark';
      setDarkMode(isDark);
      applyTheme(isDark);
      return;
    }
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    applyTheme(prefersDark);
  }, [setDarkMode]);

  useEffect(() => {
    applyTheme(isDarkMode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
  }, [isDarkMode]);

  return null;
}
