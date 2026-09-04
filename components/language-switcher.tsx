'use client';

import React from 'react';
import { useLanguage, Locale } from './i18n-provider';
import { Globe } from 'lucide-react';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'full' | 'compact';
}

export function LanguageSwitcher({ className = '', variant = 'full' }: LanguageSwitcherProps) {
  const { locale, setLocale } = useLanguage();

  const toggleLocale = () => {
    const nextLocale: Locale = locale === 'ru' ? 'uz' : 'ru';
    setLocale(nextLocale);
  };

  return (
    <button
      type="button"
      onClick={toggleLocale}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-[#1e293b] hover:bg-slate-800 text-slate-200 hover:text-white transition-all text-xs font-semibold cursor-pointer ${className}`}
      title={locale === 'ru' ? "Сменить язык на O'zbekcha" : "Tilni Ruschaga o'zgartirish"}
    >
      <Globe className="w-3.5 h-3.5 text-orange-400 shrink-0" />
      {variant === 'full' ? (
        <span className="flex items-center gap-1">
          <span className={locale === 'ru' ? 'text-white font-bold' : 'text-slate-400'}>RU</span>
          <span className="text-slate-600">/</span>
          <span className={locale === 'uz' ? 'text-white font-bold' : 'text-slate-400'}>UZ</span>
        </span>
      ) : (
        <span className="uppercase font-bold text-white">{locale}</span>
      )}
    </button>
  );
}
