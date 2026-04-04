import enTranslations from '../locales/en.json';
import viTranslations from '../locales/vi.json';

type Language = 'vi' | 'en';

const translations: Record<Language, any> = {
  vi: viTranslations,
  en: enTranslations,
};

/**
 * Translates a given key based on the provided language.
 * Defaults to 'vi' if language is not provided or unsupported.
 */
export const translate = (key: string, lang: string = 'vi'): string => {
  const language = lang === 'en' || lang === 'vi' ? (lang as Language) : 'vi';
  const keys = key.split('.');
  let value = translations[language];

  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      return key; // Return the key if translation is missing
    }
  }

  return value as string;
};
