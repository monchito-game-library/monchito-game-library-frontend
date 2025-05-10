import { GameInterface } from './game.interface';

/**
 * Representa un registro persistido en IndexedDB.
 * Asocia un juego con el identificador de usuario que lo posee.
 */
export interface GameRecord {
  /** ID primario en IndexedDB (autogenerado por Dexie) */
  id?: number;

  /** ID del usuario propietario del juego */
  userId: string;

  /** Datos del juego */
  game: GameInterface;
}
