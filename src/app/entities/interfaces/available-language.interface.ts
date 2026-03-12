import { LanguageType } from '@/types/language.type';

/** Represents a language available in the application, used in the language selector. */
export interface AvailableLanguageInterface {
  /** IETF language code (e.g. 'es', 'en'). */
  code: LanguageType;
  /** Transloco key for the translated language name. */
  labelKey: string;
}
