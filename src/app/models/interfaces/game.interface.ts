import { GameConditionType } from '../types/game-condition.type';
import { PlatformType } from '../types/platform.type';
import { SToreType } from '../types/stores.type';

/**
 * Representa un videojuego registrado por un usuario en la aplicación.
 */
export interface GameInterface {
  /**
   * ID único en IndexedDB (autogenerado)
   */
  id?: number;

  /**
   * URL relativa de la imagen personalizada del juego (opcional)
   */
  image?: string;

  /**
   * Título del juego
   */
  title: string;

  /**
   * Precio del juego en euros
   */
  price: number | null;

  /**
   * Tienda donde fue comprado el juego (ej.: Amazon, Game, Wallapop)
   */
  store: SToreType | null;

  /**
   * Estado del juego: nuevo o usado
   */
  condition: GameConditionType;

  /**
   * Indica si el juego tiene el trofeo de platino
   */
  platinum: boolean;

  /**
   * Comentarios o notas adicionales sobre el juego
   */
  description: string;

  /**
   * Plataforma del juego (puede ser null si no se ha seleccionado)
   */
  platform: PlatformType | null;
}
