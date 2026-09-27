import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS, Translations } from './translations';
import { LanguageCode } from '../components/views/SettingsView';

interface LanguageContextType {
  lang: LanguageCode;
  setLang: (lang: LanguageCode) => void;
  t: Translations;
  isRtl: boolean;
  dir: 'rtl' | 'ltr';
  formatPrice: (amount: number) => string;
  getDishName: (dish: { name: string; name_ps?: string; name_en?: string }) => string;
  getDishDescription: (dish: { description: string; description_ps?: string; description_en?: string }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({
  children,
  initialLang = 'fa',
  onLangChange,
}: {
  children: React.ReactNode;
  initialLang?: LanguageCode;
  onLangChange?: (lang: LanguageCode) => void;
}) {
  const [lang, setLangState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('app_language') as LanguageCode;
    return saved && ['fa', 'ps', 'en'].includes(saved) ? saved : initialLang;
  });

  const setLang = (newLang: LanguageCode) => {
    setLangState(newLang);
    localStorage.setItem('app_language', newLang);
    if (onLangChange) {
      onLangChange(newLang);
    }
  };

  const isRtl = lang === 'fa' || lang === 'ps';
  const dir = isRtl ? 'rtl' : 'ltr';

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = dir;
  }, [lang, dir]);

  const t = TRANSLATIONS[lang] || TRANSLATIONS.fa;

  const formatPrice = (amount: number) => {
    return `$${Number(amount || 0).toLocaleString()}`;
  };

  const getDishName = (dish: { name: string; name_ps?: string; name_en?: string }) => {
    if (lang === 'en' && dish.name_en) return dish.name_en;
    if (lang === 'ps' && dish.name_ps) return dish.name_ps;
    return dish.name;
  };

  const getDishDescription = (dish: { description: string; description_ps?: string; description_en?: string }) => {
    if (lang === 'en' && dish.description_en) return dish.description_en;
    if (lang === 'ps' && dish.description_ps) return dish.description_ps;
    return dish.description;
  };

  return (
    <LanguageContext.Provider
      value={{
        lang,
        setLang,
        t,
        isRtl,
        dir,
        formatPrice,
        getDishName,
        getDishDescription,
      }}
    >
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
