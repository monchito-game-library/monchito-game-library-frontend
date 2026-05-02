import { GameStatus } from '@/types/game-status.type';

/** Row from the game_catalog table. */
export interface GameCatalogDto {
  id?: string;
  /** Null for manually-added games. */
  rawg_id: number | null;
  slug: string;
  title: string;
  description?: string;
  description_raw?: string;
  released_date: string | null;
  tba?: boolean;
  image_url: string | null;
  background_image_additional?: string | null;
  rating: number;
  rating_top?: number;
  ratings_count?: number;
  reviews_count?: number;
  metacritic_score: number | null;
  metacritic_url?: string | null;
  esrb_rating: string | null;
  /** e.g. ['PlayStation 5', 'PC', 'Xbox Series S/X'] */
  platforms: string[];
  parent_platforms?: string[];
  genres: string[];
  tags?: string[];
  developers?: string[];
  publishers?: string[];
  stores?: GameStoreDto[];
  screenshots?: string[];
  website?: string | null;
  source: 'rawg' | 'manual';
  added_by_user_id?: string | null;
  times_added_by_users?: number;
  created_at?: string;
  updated_at?: string;
  last_synced_at?: string | null;
}

/** Digital store entry linked to a game_catalog row. */
export interface GameStoreDto {
  id: number;
  name: string;
  domain?: string;
  url?: string;
}

/**
 * Row from the user_games table (cada copia que el usuario tiene). Atributos
 * de obra (status, personal_rating, is_favorite, platform) viven en
 * user_works — ver UserWorkDto.
 */
export interface UserGameDto {
  id?: string;
  user_id: string;
  game_catalog_id: string;
  /** FK a user_works. Identifica la obra a la que pertenece esta copia. */
  work_id: string;
  price: number | null;
  store: string | null;
  condition: 'new' | 'used' | null;
  edition: string | null;
  format: 'digital' | 'physical' | null;
  description: string | null | undefined;
  cover_position: string | null;
  custom_image_url?: string | null;
  for_sale: boolean;
  sale_price: number | null;
  sold_at: string | null;
  sold_price_final: number | null;
  created_at?: string;
  updated_at?: string;
}

/** Row from the user_games_full view (joins user_games + game_catalog + user_works). */
export interface UserGameFullDto extends UserGameDto {
  // Atributos de obra (vienen del JOIN con user_works)
  user_platform: string | null;
  status: GameStatus;
  personal_rating: number | null;
  is_favorite: boolean;

  // Catálogo (game_catalog)
  user_notes?: string | null;
  rawg_id: number | null;
  title: string;
  slug: string;
  image_url: string | null;
  released_date: string | null;
  rawg_rating: number;
  metacritic_score: number | null;
  esrb_rating: string | null;
  available_platforms: string[];
  parent_platforms?: string[];
  genres: string[];
  tags?: string[];
  developers?: string[];
  publishers?: string[];
  source: 'rawg' | 'manual';

  /** UUID of the active loan row. Null if not on loan. */
  active_loan_id?: string | null;
  /** Name of the person the game is loaned to. Null if not on loan. */
  active_loan_to?: string | null;
  /** Date the active loan started (ISO string). Null if not on loan. */
  active_loan_at?: string | null;
}

/**
 * Subset of user_games_full returned by the edit-form select.
 * Only the columns the form actually needs — avoids fetching catalog metadata.
 */
export interface UserGameEditDto {
  id: string;
  user_id: string;
  game_catalog_id: string;
  work_id: string;
  title: string;
  slug: string;
  image_url: string | null;
  rawg_id: number | null;
  price: number | null;
  store: string | null;
  user_platform: string | null;
  condition: 'new' | 'used' | null;
  user_notes: string | null;
  description: string | null | undefined;
  status: string;
  personal_rating: number | null;
  edition: string | null;
  format: 'digital' | 'physical' | null;
  is_favorite: boolean;
  released_date: string | null;
  rawg_rating: number;
  genres: string[];
  cover_position: string | null;
  for_sale: boolean;
  sale_price: number | null;
  sold_at: string | null;
  sold_price_final: number | null;
  /** UUID of the active loan row. Null if not on loan. */
  active_loan_id?: string | null;
  /** Name of the person the game is loaned to. Null if not on loan. */
  active_loan_to?: string | null;
  /** Date the active loan started (ISO string). Null if not on loan. */
  active_loan_at?: string | null;
}

/**
 * Subset of user_games_full returned by the list select.
 * Only the columns needed to render game cards and apply filters.
 */
export interface UserGameListDto {
  id: string;
  work_id: string;
  title: string;
  price: number | null;
  store: string | null;
  user_platform: string | null;
  description: string | null | undefined;
  user_notes: string | null;
  status: string;
  personal_rating: number | null;
  edition: string | null;
  format: string | null;
  is_favorite: boolean;
  image_url: string | null;
  cover_position: string | null;
  for_sale: boolean;
  sold_at: string | null;
  sold_price_final: number | null;
  /** UUID of the active loan row. Null if not on loan. */
  active_loan_id?: string | null;
  /** Name of the person the game is loaned to. Null if not on loan. */
  active_loan_to?: string | null;
  /** Date the active loan started (ISO string). Null if not on loan. */
  active_loan_at?: string | null;
}

/** Payload for inserting or updating a row in game_catalog. */
export type GameCatalogInsertDto = Partial<GameCatalogDto>;

/** Payload for inserting or updating a row in user_games. */
export type UserGameInsertDto = Partial<UserGameDto>;
