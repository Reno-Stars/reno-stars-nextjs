'use client';

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import type { Locale } from '@/i18n/config';

interface AdminLocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AdminLocaleContext = createContext<AdminLocaleContextValue | null>(null);

const STORAGE_KEY = 'admin_locale';

export function AdminLocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'en' || stored === 'zh') {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem(STORAGE_KEY, newLocale);
  }, []);

  const value = useMemo(
    () => ({ locale, setLocale, sidebarOpen, setSidebarOpen }),
    [locale, setLocale, sidebarOpen, setSidebarOpen],
  );

  return (
    <AdminLocaleContext.Provider value={value}>
      {children}
    </AdminLocaleContext.Provider>
  );
}

export function useAdminLocale(): AdminLocaleContextValue {
  const context = useContext(AdminLocaleContext);
  if (!context) {
    throw new Error('useAdminLocale must be used within AdminLocaleProvider');
  }
  return context;
}
