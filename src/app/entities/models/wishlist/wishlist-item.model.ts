/** Domain model for an item in the user's wishlist. */
export interface WishlistItemModel {
  /** Supabase UUID of the user_wishlist row. */
  id: string;
  /** UUID of the owner. */
  userId: string;
  /** UUID of the linked game_catalog entry. */
  gameCatalogId: string;
  /** Price the user wants to pay. Null if not set. */
  desiredPrice: number | null;
  /** Priority level from 1 (lowest) to 5 (highest). */
  priority: number;
  /** Personal notes. Null if not set. */
  notes: string | null;
  /** Platform the user wants this game for. Empty string means no platform specified. */
  platform: string;
  /** ISO timestamp of when the item was added to the wishlist. */
  createdAt: string;
  /** Game title from game_catalog. */
  title: string;
  /** URL slug from game_catalog. */
  slug: string;
  /** Cover image URL from game_catalog. */
  imageUrl: string | null;
  /** RAWG game ID. Null for manually-added catalog entries. */
  rawgId: number | null;
  /** Release date from game_catalog. */
  releasedDate: string | null;
  /** RAWG community rating (0–5). */
  rating: number;
  /** Available platforms from game_catalog. */
  platforms: string[];
  /** Genres from game_catalog. */
  genres: string[];
}
