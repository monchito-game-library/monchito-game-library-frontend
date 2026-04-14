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
}
