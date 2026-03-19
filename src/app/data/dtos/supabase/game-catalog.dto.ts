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

/** Row from the user_games table. */
export interface UserGameDto {
  id?: string;
  user_id: string;
  game_catalog_id: string;
  price: number | null;
  store: string | null;
  platform: string | null;
  condition: 'new' | 'used' | null;
  purchased_date: string | null;
  platinum: boolean;
  status: GameStatus;
  personal_rating: number | null;
  personal_review?: string | null;
  edition: string | null;
  format: 'digital' | 'physical' | null;
  started_date: string | null;
  completed_date: string | null;
  platinum_date: string | null;
  description: string | null | undefined;
  tags_personal?: string[];
  is_favorite: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Row from the user_games_full view (joins user_games + game_catalog). */
export interface UserGameFullDto extends UserGameDto {
  /** User's platform choice (overrides catalog platform). */
  user_platform?: string | null;
  /** User's personal notes (overrides catalog description). */
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
}

/**
 * Subset of user_games_full returned by the edit-form select.
 * Only the columns the form actually needs — avoids fetching catalog metadata.
 */
export interface UserGameEditDto {
  id: string;
  user_id: string;
  game_catalog_id: string;
  title: string;
  slug: string;
  image_url: string | null;
  rawg_id: number | null;
  price: number | null;
  store: string | null;
  user_platform: string | null;
  condition: 'new' | 'used' | null;
  platinum: boolean;
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
}

/**
 * Subset of user_games_full returned by the list select.
 * Only the columns needed to render game cards and apply filters.
 */
export interface UserGameListDto {
  id: string;
  title: string;
  price: number | null;
  store: string | null;
  user_platform: string | null;
  platinum: boolean;
  description: string | null | undefined;
  user_notes: string | null;
  status: string;
  personal_rating: number | null;
  edition: string | null;
  format: string | null;
  is_favorite: boolean;
  image_url: string | null;
}

/** Payload for inserting or updating a row in game_catalog. */
export type GameCatalogInsertDto = Partial<GameCatalogDto>;

/** Payload for inserting or updating a row in user_games. */
export type UserGameInsertDto = Partial<UserGameDto>;
