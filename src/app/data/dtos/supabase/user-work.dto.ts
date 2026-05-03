import { GameStatus } from '@/types/game-status.type';

/** Row from the user_works table — atributos de la obra (compartidos entre todas sus copias). */
export interface UserWorkDto {
  id?: string;
  user_id: string;
  game_catalog_id: string;
  /** Plataforma de la obra. Identifica la obra junto con (user_id, game_catalog_id). */
  platform: string;
  status: GameStatus;
  personal_rating: number | null;
  is_favorite: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Payload for inserting or updating a row in user_works. */
export type UserWorkInsertDto = Partial<UserWorkDto>;
