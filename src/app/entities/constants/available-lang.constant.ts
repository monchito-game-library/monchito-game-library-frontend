import { AvailableLanguageInterface } from '../interfaces/available-language.interface';

/**
 * Idiomas soportados por la aplicación.
 * Usados en el menú de selección de idioma del header.
 */
export const availableLangConstant: AvailableLanguageInterface[] = [
  { code: 'en', labelKey: 'home.language.option.en' },
  { code: 'es', labelKey: 'home.language.option.es' }
];
