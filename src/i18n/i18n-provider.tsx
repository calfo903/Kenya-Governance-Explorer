'use client';

import React, { useMemo } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { useLocaleStore } from './locale-store';
import { messages } from './index';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocaleStore((s) => s.locale);

  const currentMessages = useMemo(
    () => messages[locale],
    [locale]
  );

  return (
    <NextIntlClientProvider
      locale={locale}
      messages={currentMessages}
    >
      {children}
    </NextIntlClientProvider>
  );
}
