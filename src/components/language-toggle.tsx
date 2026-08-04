'use client';

import React from 'react';
import { useLocaleStore } from '@/i18n/locale-store';
import { Globe } from 'lucide-react';
import type { Locale } from '@/i18n';

export function LanguageToggle() {
  const { locale, setLocale } = useLocaleStore();

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'sw' : 'en');
  };

  return (
    <button
      onClick={toggleLocale}
      className="h-8 w-8 rounded-lg border border-stone-200 dark:border-stone-700 flex items-center justify-center hover:bg-stone-50 dark:hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-800 transition-colors"
      title={locale === 'en' ? 'Badilisha kwa Kiswahili' : 'Switch to English'}
      aria-label={locale === 'en' ? 'Switch to Swahili' : 'Switch to English'}
    >
      <Globe className="h-3.5 w-3.5 text-stone-600 dark:text-stone-300" />
      <span className="sr-only">
        {locale === 'en' ? 'Switch to Swahili' : 'Switch to English'}
      </span>
    </button>
  );
}
