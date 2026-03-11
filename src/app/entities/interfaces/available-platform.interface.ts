import { PlatformType } from '../types/platform.type';

/**
 * Representa una consola de videojuegos disponible para selección o filtrado.
 * Usado en formularios y filtros por consola.
 */
export interface AvailablePlatformInterface {
  /**
   * Código de la consola (ej.: 'PS5', 'XBOX-SERIES', etc.)
   */
  code: PlatformType;

  /**
   * Clave Transloco para traducir el nombre visible de la consola
   */
  labelKey: string;
}
