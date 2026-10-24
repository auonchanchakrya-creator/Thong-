import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LanguageContextType } from '../i18n/types';
import enTranslations from '../i18n/en.json';
import kmTranslations from '../i18n/km.json';

const translations: Record<Language, any> = {
  en: enTranslations,
  km: kmTranslations,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'schoolrout_lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Set Khmer ('km') as the default language for first-time users, but honor existing preference
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'en' || saved === 'km') {
        return saved;
      }
    } catch (e) {
      console.warn('Could not read language from localStorage', e);
    }
    return 'km';
  });

  const setLanguage = (newLang: Language) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Could not save language to localStorage', e);
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split('.');
    
    // Attempt lookup in active language
    let current: any = translations[language];
    for (const k of keys) {
      if (current && typeof current === 'object' && k in current) {
        current = current[k];
      } else {
        current = undefined;
        break;
      }
    }

    // Fallback to English if missing in Khmer
    if (current === undefined && language !== 'en') {
      let fallbackCurrent: any = translations.en;
      for (const k of keys) {
        if (fallbackCurrent && typeof fallbackCurrent === 'object' && k in fallbackCurrent) {
          fallbackCurrent = fallbackCurrent[k];
        } else {
          fallbackCurrent = undefined;
          break;
        }
      }
      current = fallbackCurrent;
    }

    // If still not found, return the key itself
    if (typeof current !== 'string') {
      return key;
    }

    let result = current;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return result;
  };

  const localize = (enValue?: string, kmValue?: string): string => {
    if (language === 'km' && kmValue && kmValue.trim().length > 0) {
      return kmValue;
    }
    return enValue || kmValue || '';
  };

  const formatNumber = (num: number): string => {
    if (language === 'km') {
      const khmerDigits = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩'];
      return String(num).replace(/[0-9]/g, (d) => khmerDigits[parseInt(d, 10)]);
    }
    return String(num);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, localize, formatNumber }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
