/**
 * Interfaces para la API de RAWG
 */

export interface RawgPlatform {
  id: number;
  name: string;
  slug: string;
}

export interface RawgPlatformInfo {
  platform: RawgPlatform;
}

export interface RawgGame {
  id: number;
  name: string;
  slug: string;
  background_image: string | null;
  released: string | null;
  rating: number;
  platforms: RawgPlatformInfo[];
  genres: Array<{ id: number; name: string; slug: string }>;
  esrb_rating: { id: number; name: string; slug: string } | null;
}

export interface RawgSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGame[];
}

export interface RawgGameDetail extends RawgGame {
  description: string;
  description_raw: string;
  metacritic: number | null;
  website: string;
  developers: Array<{ id: number; name: string; slug: string }>;
  publishers: Array<{ id: number; name: string; slug: string }>;
}

/**
 * Interfaz simplificada para nuestro catálogo de juegos
 */
export interface GameCatalog {
  id?: string;
  rawg_id: number;
  title: string;
  slug: string;
  image_url: string | null;
  released_date: string | null;
  rating: number;
  platforms: string[]; // Array de nombres de plataformas
  genres: string[]; // Array de nombres de géneros
  description?: string;
  created_at?: string;
  updated_at?: string;
}
