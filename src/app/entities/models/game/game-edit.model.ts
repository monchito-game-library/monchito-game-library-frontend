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
  /** Store code where the game was purchased. */
  store: string;
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
}
