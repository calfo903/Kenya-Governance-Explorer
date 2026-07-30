import enMessages from '@/messages/en.json';
import swMessages from '@/messages/sw.json';

export type Locale = 'en' | 'sw';

export const locales: Locale[] = ['en', 'sw'];

export const localeNames: Record<Locale, string> = {
  en: 'English',
  sw: 'Kiswahili',
};

export const messages: Record<Locale, object> = {
  en: enMessages,
  sw: swMessages,
};
