'use client';

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import en from './en';
import zh from './zh';

const translations: Record<string, Record<string, string>> = { en, zh };

interface LanguageContextType {
  lang: string;
  setLang: (lang: string) => void;
  t: (key: string) => string;
  isHydrated: boolean;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  // Always start with 'en' to ensure SSR and initial client render match
  const [lang, setLangState] = useState('en');
  const [isHydrated, setIsHydrated] = useState(false);

  // Sync with localStorage after hydration
  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('lang');
      if (savedLang && (savedLang === 'en' || savedLang === 'zh')) {
        setLangState(savedLang);
      }
    } catch {
      // localStorage not available
    }
    setIsHydrated(true);
  }, []);

  const setLang = useCallback((newLang: string) => {
    setLangState(newLang);
    try {
      localStorage.setItem('lang', newLang);
    } catch {
      // localStorage not available
    }
  }, []);

  const t = useCallback((key: string) => {
    return translations[lang]?.[key] || translations.en[key] || key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isHydrated }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
