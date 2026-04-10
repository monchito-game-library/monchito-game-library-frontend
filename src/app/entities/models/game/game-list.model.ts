import { GameFormatType } from '@/types/game-format.type';
import { GameStatus } from '@/types/game-status.type';
import { PlatformType } from '@/types/platform.type';

/** Lean domain model used by the game list and game card — only the fields they need. */
export interface GameListModel {
  /** Numeric ID derived from the Supabase UUID. Used for sort-by-id and emitting delete events. */
  id?: number;
  /** Original Supabase UUID of the user_games row. Used for edit navigation and delete operations. */
  uuid?: string;
  /** Game title. */
  title: string;
  /** Purchase price. Null if unknown. */
  price: number | null;
  /** UUID of the store where the game was purchased. Null if unknown. */
  store: string | null;
  /** Platform the game belongs to. Null if not yet assigned. */
  platform: PlatformType | null;
  /** Whether the user has earned the platinum trophy. */
  platinum: boolean;
  /** Personal notes or description. Shown on the card back face. */
  description: string;
  /** Cover image URL. */
  imageUrl?: string;
  /** Current tracking status in the collection. */
  status: GameStatus;
  /** User's personal rating (0–10). Null if not rated. */
  personalRating: number | null;
  /** Edition of the game copy (e.g. 'Deluxe Edition', 'GOTY Edition'). Null if standard. */
  edition: string | null;
  /** Physical disc or digital download. Null if not specified. */
  format: GameFormatType | null;
  /** Whether the game is marked as a favourite. */
  isFavorite: boolean;
  /** CSS object-position value for the cover image (e.g. "50% 30%"). Null uses browser default. */
  coverPosition?: string | null;
  /** Whether the game is currently listed for sale. */
  forSale: boolean;
  /** Date the game was sold (ISO string). Null while still in the active collection. */
  soldAt: string | null;
  /** Final selling price. Null if not yet sold or not registered. */
  soldPriceFinal: number | null;
  /** UUID of the active loan row. Null if the game is not currently on loan. */
  activeLoanId: string | null;
  /** Name of the person the game is loaned to. Null if not on loan. */
  activeLoanTo: string | null;
  /** Date the active loan started (ISO string). Null if not on loan. */
  activeLoanAt: string | null;
}
