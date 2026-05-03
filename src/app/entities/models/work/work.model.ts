import { GameStatus } from '@/types/game-status.type';
import { PlatformType } from '@/types/platform.type';

/**
 * Domain model for an "obra" (work): the abstract game-on-platform that groups
 * 1..N copies (físico + digital) the user owns of the same game on the same
 * platform. Atributos como status, rating o favorito viven aquí porque son
 * compartidos entre todas las copias de la obra.
 */
export interface WorkModel {
  /** Supabase UUID de la fila de user_works. */
  uuid: string;
  /** UUID del usuario propietario. */
  userId: string;
  /** UUID del catálogo (game_catalog) al que pertenece la obra. */
  gameCatalogId: string;
  /** Plataforma de la obra (PS4 ≠ Xbox: dos obras distintas). */
  platform: PlatformType | null;
  /** Estado de seguimiento (compartido entre todas las copias). */
  status: GameStatus;
  /** Valoración personal de la obra (0–10). Null si no se ha valorado. */
  personalRating: number | null;
  /** Marca de favorito a nivel obra. */
  isFavorite: boolean;
}
