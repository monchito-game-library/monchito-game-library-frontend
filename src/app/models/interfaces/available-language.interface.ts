import { LanguageType } from '../types/language.type';

/**
 * Representa un idioma disponible en la aplicación.
 * Usado para mostrar el selector de idioma y traducir el contenido.
 */
export interface AvailableLanguageInterface {
  /**
   * Código del idioma según el estándar IETF (ej.: 'es', 'en')
   */
  code: LanguageType;

  /**
   * Clave Transloco para mostrar el nombre traducido del idioma
   */
  labelKey: string;
}
