import { SToreType } from '../types/stores.type';

/**
 * Representa una tienda de videojuegos disponible para selección o filtrado.
 * Usado en formularios y filtros por tienda.
 */
export interface AvailableStoresInterface {
  /**
   * Código de la tienda (ej.: 'gm-ibe', 'amz', etc.
   */
  code: SToreType;

  /**
   * Clave Transloco para mostrar el nombre traducido del idioma
   */
  labelKey: string;
}
