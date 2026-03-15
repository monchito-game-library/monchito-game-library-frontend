import { GameConditionType } from '@/types/game-condition.type';
import { GameFormatType } from '@/types/game-format.type';
import { GameStatus } from '@/types/game-status.type';
import { PlatformType } from '@/types/platform.type';

/** Domain model for a game in the user's collection. */
export interface GameModel {
  /** Numeric ID derived from the Supabase UUID. */
  id?: number;
  /** Original Supabase UUID of the user_games row. Used for direct DB lookups. */
  uuid?: string;
  /** Game title. */
  title: string;
  /** Purchase price. Null if unknown. */
  price: number | null;
  /** UUID of the store where the game was purchased. Null if unknown. */
  store: string | null;
  /** Physical condition of the game copy. */
  condition: GameConditionType;
  /** Whether the user has earned the platinum trophy. */
  platinum: boolean;
  /** Personal notes or description. */
  description: string;
  /** Platform the game belongs to. Null if not yet assigned. */
  platform: PlatformType | null;
  /** Cover image URL. */
  imageUrl?: string;
  /** RAWG ID of the linked catalogue entry. Null for manually-added games. */
  rawgId?: number | null;
  /** RAWG slug of the linked catalogue entry. Used to fetch screenshots. */
  rawgSlug?: string | null;
  /** Current tracking status in the collection. */
  status: GameStatus;
  /** User's personal rating (0–10). Null if not rated. */
  personalRating: number | null;
  /** Edition of the game copy (e.g. 'Deluxe Edition', 'GOTY Edition'). Null if standard. */
  edition: string | null;
  /** Whether the game is digital or physical. Null if not specified. */
  format: GameFormatType | null;
  /** Whether the game is marked as a favourite. */
  isFavorite: boolean;
}
