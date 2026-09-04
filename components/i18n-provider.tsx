'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import ruMessages from '@/messages/ru.json';
import uzMessages from '@/messages/uz.json';

export type Locale = 'ru' | 'uz';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'ru',
  setLocale: () => {},
});

const messagesMap: Record<Locale, any> = {
  ru: ruMessages,
  uz: uzMessages,
};

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('ru');

  useEffect(() => {
    const saved = localStorage.getItem('app_locale') as Locale;
    if (saved && (saved === 'ru' || saved === 'uz')) {
      setLocaleState(saved);
    } else {
      const match = document.cookie.match(/NEXT_LOCALE=(ru|uz)/);
      if (match) {
        setLocaleState(match[1] as Locale);
      }
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    localStorage.setItem('app_locale', newLocale);
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={messagesMap[locale]}>
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
