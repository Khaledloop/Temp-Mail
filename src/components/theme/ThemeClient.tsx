'use client';

import { useEffect } from 'react';
import { useUiStore } from '@/store/uiStore';

export function ThemeClient() {
  const { isDarkMode, setDarkMode } = useUiStore();

  useEffect(() => {
    // 1. عند التحميل: مزامنة الحالة مع التخزين المحلي أو تفضيلات النظام
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (stored === 'dark' || (!stored && prefersDark)) {
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }
  }, [setDarkMode]);

  useEffect(() => {
    // 2. تطبيق التغييرات على DOM عند تغير الحالة
    const root = document.documentElement;
    const body = document.body;
    
    // تنظيف ستايل منع الوميض الذي تمت إضافته في layout.tsx
    const tempStyle = document.getElementById('dark-mode-style');
    if (tempStyle) {
      tempStyle.remove();
    }

    if (isDarkMode) {
      root.classList.add('dark');
      root.dataset.theme = 'dark';
      root.style.colorScheme = 'dark';
      
      // إجبار الخلفية على اللون الداكن
      body.style.backgroundColor = '#050505'; 
      body.style.color = '#f5f5f5';
      
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      root.dataset.theme = 'light';
      root.style.colorScheme = 'light';
      
      // إزالة الأنماط اليدوية
      body.style.backgroundColor = '';
      body.style.color = '';
      
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  return null;
}