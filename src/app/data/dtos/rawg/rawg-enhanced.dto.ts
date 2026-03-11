/**
 * Interfaces mejoradas para la API de RAWG.io
 * Documentación: https://api.rawg.io/docs/
 */

/**
 * Plataforma en RAWG
 */
export interface RawgPlatform {
  id: number;
  name: string;
  slug: string;
}

/**
 * Información de plataforma con detalles
 */
export interface RawgPlatformInfo {
  platform: RawgPlatform;
  released_at?: string;
  requirements?: {
    minimum?: string;
    recommended?: string;
  };
}

/**
 * Plataforma padre (agrupación general)
 */
export interface RawgParentPlatform {
  platform: {
    id: number;
    name: string; // 'PC', 'PlayStation', 'Xbox', 'Nintendo', etc.
    slug: string;
  };
}

/**
 * Género de juego
 */
export interface RawgGenre {
  id: number;
  name: string;
  slug: string;
  games_count?: number;
  image_background?: string;
}

/**
 * Tag/Etiqueta
 */
export interface RawgTag {
  id: number;
  name: string;
  slug: string;
  language?: string;
  games_count?: number;
}

/**
 * Clasificación ESRB
 */
export interface RawgEsrbRating {
  id: number;
  name: string; // 'Everyone', 'Everyone 10+', 'Teen', 'Mature', 'Adults Only', 'Rating Pending'
  slug: string; // 'everyone', 'everyone-10-plus', 'teen', 'mature', 'adults-only', 'rating-pending'
}

/**
 * Desarrollador
 */
export interface RawgDeveloper {
  id: number;
  name: string;
  slug: string;
  games_count?: number;
  image_background?: string;
}

/**
 * Publisher/Editor
 */
export interface RawgPublisher {
  id: number;
  name: string;
  slug: string;
  games_count?: number;
  image_background?: string;
}

/**
 * Tienda digital
 */
export interface RawgStore {
  id: number;
  name: string; // 'Steam', 'PlayStation Store', 'Xbox Store', etc.
  slug: string;
  domain?: string;
  games_count?: number;
  image_background?: string;
}

/**
 * Información de tienda para un juego
 */
export interface RawgStoreInfo {
  id: number;
  store: RawgStore;
  url?: string;
}

/**
 * Screenshot
 */
export interface RawgScreenshot {
  id: number;
  image: string;
  width?: number;
  height?: number;
  is_deleted?: boolean;
}

/**
 * Rating detallado
 */
export interface RawgRating {
  id: number;
  title: string; // 'exceptional', 'recommended', 'meh', 'skip'
  count: number;
  percent: number;
}

/**
 * Juego base de RAWG (respuesta de búsqueda /games)
 */
export interface RawgGame {
  id: number;
  slug: string;
  name: string;
  released: string | null;
  tba: boolean;
  background_image: string | null;
  rating: number;
  rating_top: number;
  ratings: RawgRating[];
  ratings_count: number;
  reviews_text_count: number;
  added: number;
  added_by_status?: {
    yet?: number;
    owned?: number;
    beaten?: number;
    toplay?: number;
    dropped?: number;
    playing?: number;
  };
  metacritic: number | null;
  playtime: number;
  suggestions_count: number;
  updated: string;
  user_game?: any; // Si está autenticado
  reviews_count: number;
  saturated_color?: string;
  dominant_color?: string;

  // Relaciones
  platforms: RawgPlatformInfo[];
  parent_platforms: RawgParentPlatform[];
  genres: RawgGenre[];
  stores: RawgStoreInfo[];
  clip?: any;
  tags: RawgTag[];
  esrb_rating: RawgEsrbRating | null;
  short_screenshots: RawgScreenshot[];
}

/**
 * Respuesta de búsqueda de RAWG
 */
export interface RawgSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawgGame[];
  seo_title?: string;
  seo_description?: string;
  seo_keywords?: string;
  seo_h1?: string;
  noindex?: boolean;
  nofollow?: boolean;
  description?: string;
  filters?: any;
  nofollow_collections?: string[];
}

/**
 * Detalles completos de un juego (/games/{id})
 */
export interface RawgGameDetail extends RawgGame {
  name_original: string;
  description: string; // HTML
  description_raw: string; // Plain text
  metacritic_platforms: Array<{
    metascore: number;
    url: string;
    platform: {
      platform: number;
      name: string;
      slug: string;
    };
  }>;
  website: string;
  reddit_url: string;
  reddit_name: string;
  reddit_description: string;
  reddit_logo: string;
  reddit_count: number;
  twitch_count: number;
  youtube_count: number;
  screenshots_count: number;
  movies_count: number;
  creators_count: number;
  achievements_count: number;
  parent_achievements_count: number;

  // Desarrolladores y publishers completos
  developers: RawgDeveloper[];
  publishers: RawgPublisher[];

  // Ratings detallados
  reactions?: Record<string, number>;

  // Información adicional
  alternative_names?: string[];
  metacritic_url?: string;
}

/**
 * Parámetros de búsqueda para RAWG
 */
export interface RawgSearchParams {
  search?: string;
  page?: number;
  page_size?: number; // max 40
  search_precise?: boolean;
  search_exact?: boolean;
  parent_platforms?: string; // '1,2,3' (IDs separados por coma)
  platforms?: string; // '4,187,1' (IDs separados por coma)
  stores?: string; // IDs separados por coma
  developers?: string; // IDs o slugs
  publishers?: string; // IDs o slugs
  genres?: string; // IDs o slugs separados por coma
  tags?: string; // IDs o slugs separados por coma
  dates?: string; // '2020-01-01,2020-12-31' o '2020' o '2019-01-01,2020-12-31'
  updated?: string; // Fecha de actualización
  ordering?: string; // '-added', '-released', '-rating', '-metacritic', 'name', etc.
  metacritic?: string; // '80,100'
  exclude_collection?: number;
  exclude_additions?: boolean;
  exclude_parents?: boolean;
  exclude_game_series?: boolean;
  exclude_stores?: string;
}
