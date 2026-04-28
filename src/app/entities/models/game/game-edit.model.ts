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
  /** CSS object-position value for the cover image (e.g. "50% 30%"). Null uses browser default. */
  coverPosition: string | null;
  /** Whether the game is currently listed for sale. */
  forSale: boolean;
  /** Desired selling price. Null if not set. */
  salePrice: number | null;
  /** Date the game was sold (ISO string). Null while still active. */
  soldAt: string | null;
  /** Final price obtained from the sale. Null if not sold yet. */
  soldPriceFinal: number | null;
  /** UUID of the active loan row. Null if the game is not currently on loan. */
  activeLoanId: string | null;
  /** Name of the person the game is loaned to. Null if not on loan. */
  activeLoanTo: string | null;
  /** Date the active loan started (ISO string). Null if not on loan. */
  activeLoanAt: string | null;
}
