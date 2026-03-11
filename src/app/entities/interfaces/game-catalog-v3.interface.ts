/**
 * Interfaces para el schema v3 mejorado
 * Corresponde con supabase-schema-v3-enhanced.sql
 */

/**
 * Catálogo global de juegos (game_catalog)
 * Compartido por todos los usuarios
 */
export interface GameCatalogV3 {
  // Identificadores
  id?: string;
  rawg_id: number | null; // NULL para juegos manuales
  slug: string;

  // Información básica
  title: string;
  description?: string;
  description_raw?: string;
  released_date: string | null;
  tba?: boolean;

  // Imágenes
  image_url: string | null;
  background_image_additional?: string | null;

  // Ratings y popularidad
  rating: number;
  rating_top?: number;
  ratings_count?: number;
  reviews_count?: number;
  metacritic_score: number | null;
  metacritic_url?: string | null;

  // Clasificación por edad
  esrb_rating: string | null;

  // Plataformas
  platforms: string[]; // ['PlayStation 5', 'PC', 'Xbox Series S/X']
  parent_platforms?: string[]; // ['PlayStation', 'PC', 'Xbox']

  // Géneros y etiquetas
  genres: string[];
  tags?: string[];

  // Desarrolladores y publishers
  developers?: string[];
  publishers?: string[];

  // Tiendas digitales
  stores?: GameStore[];

  // Screenshots
  screenshots?: string[];

  // Website
  website?: string | null;

  // Metadata
  source: 'rawg' | 'manual';
  added_by_user_id?: string | null;
  times_added_by_users?: number;

  // Timestamps
  created_at?: string;
  updated_at?: string;
  last_synced_at?: string | null;
}

/**
 * Tienda digital donde está disponible el juego
 */
export interface GameStore {
  id: number;
  name: string;
  domain?: string;
  url?: string;
}

/**
 * Colección personal del usuario (user_games)
 */
export interface UserGame {
  id?: string;
  user_id: string;
  game_catalog_id: string;

  // Datos de compra
  price: number | null;
  store: string | null; // Tienda física
  platform: string | null;
  condition: 'new' | 'used' | null;
  purchased_date: string | null;

  // Estado del juego
  platinum: boolean;
  status: GameStatus;

  // Rating y review personal
  personal_rating: number | null; // 0-10
  personal_review?: string | null;

  // Gameplay tracking
  hours_played: number;
  started_date: string | null;
  completed_date: string | null;
  platinum_date: string | null;

  // Notas personales
  description: string | null | undefined;
  tags_personal?: string[];

  // Favorito
  is_favorite: boolean;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

/**
 * Estados posibles de un juego en la colección
 */
export type GameStatus =
  | 'wishlist' // En lista de deseos (deprecated, usar user_wishlist)
  | 'backlog' // Sin empezar
  | 'playing' // Jugando actualmente
  | 'completed' // Completado
  | 'platinum' // Platino conseguido
  | 'abandoned' // Abandonado
  | 'owned'; // Solo lo tengo (no especificado)

/**
 * Lista de deseos (user_wishlist)
 */
export interface UserWishlist {
  id?: string;
  user_id: string;
  game_catalog_id: string;

  // Precio deseado
  desired_price: number | null;

  // Prioridad (1=máxima, 5=mínima)
  priority: 1 | 2 | 3 | 4 | 5;

  // Notas
  notes?: string | null;

  // Notificaciones
  notify_on_sale: boolean;

  // Timestamps
  created_at?: string;
  updated_at?: string;
}

/**
 * Vista completa: user_games + game_catalog
 */
export interface UserGameFull extends UserGame {
  // Datos del catálogo (game_catalog)
  rawg_id: number | null;
  title: string;
  slug: string;
  // description ya viene de UserGame, no redeclaramos
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
 * Vista de wishlist con datos del catálogo
 */
export interface UserWishlistFull extends UserWishlist {
  title: string;
  slug: string;
  image_url: string | null;
  released_date: string | null;
  rating: number;
  metacritic_score: number | null;
  platforms: string[];
  genres: string[];
}

/**
 * Estadísticas del catálogo
 */
export interface GameCatalogStats extends GameCatalogV3 {
  actual_users_count: number;
  avg_personal_rating: number | null;
  platinum_count: number;
  favorite_count: number;
}

/**
 * Resultado de búsqueda en catálogo
 */
export interface GameCatalogSearchResult {
  id: string;
  rawg_id: number | null;
  title: string;
  slug: string;
  image_url: string | null;
  released_date: string | null;
  rating: number;
  metacritic_score: number | null;
  platforms: string[];
  genres: string[];
  source: 'rawg' | 'manual';
  relevance: number; // Score de relevancia de búsqueda
}

/**
 * Filtros para búsqueda en catálogo
 */
export interface GameCatalogFilters {
  query?: string;
  platforms?: string[];
  genres?: string[];
  tags?: string[];
  esrb_rating?: string[];
  min_rating?: number;
  max_rating?: number;
  min_metacritic?: number;
  max_metacritic?: number;
  year?: number;
  year_from?: number;
  year_to?: number;
  source?: 'rawg' | 'manual' | 'all';
  order_by?: 'rating' | 'metacritic' | 'released_date' | 'title' | 'popularity';
  order_direction?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

/**
 * Formulario para añadir juego manual al catálogo
 */
export interface AddManualGameForm {
  title: string;
  slug: string;
  platforms: string[];
  genres: string[];
  released_date: string | null;
  image_url?: string | null;
  description?: string | null;
  esrb_rating?: string | null;
  developers?: string[];
  publishers?: string[];
}

/**
 * Estadísticas de usuario
 */
export interface UserGameStats {
  total_games: number;
  total_spent: number;
  by_platform: Record<string, number>;
  by_store: Record<string, number>;
  by_status: Record<GameStatus, number>;
  platinum_count: number;
  platinum_percentage: number;
  completion_rate: number;
  average_price: number;
  average_personal_rating: number;
  total_hours_played: number;
  favorites_count: number;
  wishlist_count: number;
}
