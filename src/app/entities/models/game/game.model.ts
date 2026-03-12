import { GameConditionType } from '@/types/game-condition.type';
import { GameStatus } from '@/types/game-status.type';
import { PlatformType } from '@/types/platform.type';
import { StoreType } from '@/types/stores.type';

/** Domain model for a game in the user's collection. */
export interface GameModel {
  /** Numeric ID derived from the Supabase UUID. */
  id?: number;
  /** Game title. */
  title: string;
  /** Purchase price. Null if unknown. */
  price: number | null;
  /** Store where the game was purchased. */
  store: StoreType;
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
  /** Current tracking status in the collection. */
  status: GameStatus;
  /** User's personal rating (0–10). Null if not rated. */
  personalRating: number | null;
  /** Approximate hours played. */
  hoursPlayed: number;
  /** Whether the game is marked as a favourite. */
  isFavorite: boolean;
}
