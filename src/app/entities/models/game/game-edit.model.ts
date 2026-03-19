import { GameConditionType } from '@/types/game-condition.type';
import { GameFormatType } from '@/types/game-format.type';
import { GameStatus } from '@/types/game-status.type';
import { PlatformType } from '@/types/platform.type';

/** Minimal model used exclusively by the game edit form. Contains only the fields the form needs. */
export interface GameEditModel {
  /** Supabase UUID of the user_games row. */
  uuid: string;
  /** Numeric ID derived from the UUID. */
  id?: number;
  /** Game title. */
  title: string;
  /** Purchase price. */
  price: number | null;
  /** UUID of the store where the game was purchased. Null if unknown. */
  store: string | null;
  /** Platform the game belongs to. */
  platform: PlatformType | null;
  /** Physical condition of the game copy. */
  condition: GameConditionType;
  /** Whether the user has earned the platinum trophy. */
  platinum: boolean;
  /** Personal notes. */
  description: string;
  /** Current tracking status. */
  status: GameStatus;
  /** User's personal rating (0–10). */
  personalRating: number | null;
  /** Edition of the game copy. */
  edition: string | null;
  /** Whether the game is digital or physical. */
  format: GameFormatType | null;
  /** Whether the game is marked as a favourite. */
  isFavorite: boolean;
  /** Cover image URL. */
  imageUrl: string | null;
  /** RAWG numeric ID — used to fetch screenshots. */
  rawgId: number | null;
  /** RAWG slug — preferred identifier for screenshot fetching. */
  rawgSlug: string | null;
  /** Release date from RAWG. */
  releasedDate: string | null;
  /** RAWG community rating. */
  rawgRating: number;
  /** Game genres from RAWG. */
  genres: string[];
}
