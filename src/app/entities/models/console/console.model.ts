import { GameConditionType } from '@/types/game-condition.type';
import { ConsoleRegionType } from '@/types/console-region.type';

/** Domain model for a console owned by the user. */
export interface ConsoleModel {
  /** Supabase UUID of the user_consoles row. */
  id: string;
  /** UUID of the owner. */
  userId: string;
  /** UUID of the hardware brand (references hardware_brands). */
  brandId: string;
  /** UUID of the hardware model (references hardware_models). */
  modelId: string;
  /** UUID of the hardware edition (references hardware_editions). Null if standard edition. */
  editionId: string | null;
  /** Geographic region. Null if not specified. */
  region: ConsoleRegionType | null;
  /** Physical condition. */
  condition: GameConditionType;
  /** Purchase price. Null if not recorded. */
  price: number | null;
  /** Store where it was purchased. Null if not recorded. */
  store: string | null;
  /** Purchase date (ISO date string). Null if not recorded. */
  purchaseDate: string | null;
  /** Personal notes. Null if not set. */
  notes: string | null;
  /** ISO timestamp of when the record was created. */
  createdAt: string;
  /** Whether the console is listed for sale. */
  forSale: boolean;
  /** Asking price. Null if not set. */
  salePrice: number | null;
  /** Date the console was sold (ISO date string). Null if still owned. */
  soldAt: string | null;
  /** Final sale price obtained. Null if not sold. */
  soldPriceFinal: number | null;
  /** UUID of the active hardware_loans row. Null if not loaned. */
  activeLoanId: string | null;
  /** Name of the person the console is loaned to. Null if not loaned. */
  activeLoanTo: string | null;
  /** Date the active loan started (ISO date string). Null if not loaned. */
  activeLoanAt: string | null;
}
