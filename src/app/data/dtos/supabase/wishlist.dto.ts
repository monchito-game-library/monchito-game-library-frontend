/** Row from the user_wishlist_full view (joins user_wishlist + game_catalog). */
export interface WishlistFullDto {
  id: string;
  user_id: string;
  game_catalog_id: string;
  platform: string;
  desired_price: number | null;
  priority: number;
  notes: string | null;
  created_at: string;
  /** From game_catalog join. */
  title: string;
  /** From game_catalog join. */
  slug: string;
  /** From game_catalog join. */
  image_url: string | null;
  /** RAWG game ID. Null for manually-added catalog entries. */
  rawg_id: number | null;
  /** From game_catalog join. */
  released_date: string | null;
  /** From game_catalog join. */
  rating: number;
  /** From game_catalog join. */
  platforms: string[];
  /** From game_catalog join. */
  genres: string[];
}

/** Payload for inserting or updating a row in user_wishlist. */
export interface WishlistInsertDto {
  user_id: string;
  game_catalog_id: string;
  platform: string;
  desired_price: number | null;
  priority: number;
  notes: string | null;
}

/** Payload for updating an existing user_wishlist row. */
export type WishlistUpdateDto = Partial<Omit<WishlistInsertDto, 'user_id' | 'game_catalog_id'>>;
