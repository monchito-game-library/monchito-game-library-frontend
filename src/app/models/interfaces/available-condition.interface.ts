import { GameConditionType } from '../types/game-condition.type';

/**
 * Representa una opción de condición para un videojuego (Nuevo o Usado).
 * Utilizado en formularios y listas desplegables.
 */
export interface AvailableConditionInterface {
  /**
   * Código interno de la condición ('new' o 'used')
   */
  code: GameConditionType;

  /**
   * Clave de traducción para mostrar en la interfaz (ej.: 'gameForm.conditions.new')
   */
  labelKey: string;
}
