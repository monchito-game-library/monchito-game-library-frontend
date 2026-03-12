import { AvailableLanguageInterface } from '@/interfaces/available-language.interface';

/** Languages supported by the application, shown in the header language selector. */
export const availableLangConstant: AvailableLanguageInterface[] = [
  { code: 'en', labelKey: 'home.language.option.en' },
  { code: 'es', labelKey: 'home.language.option.es' }
];
