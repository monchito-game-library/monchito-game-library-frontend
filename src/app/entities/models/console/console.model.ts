import { GameConditionType } from '@/types/game-condition.type';
import { ConsoleRegionType } from '@/types/console-region.type';

/** Domain model for a console owned by the user. */
export interface ConsoleModel {
  /** Supabase UUID of the user_consoles row. */
  id: string;
  /** UUID of the owner. */
  userId: string;
  /** Brand of the console (e.g. Sony, Microsoft, Nintendo). */
  brand: string;
  /** Model name (e.g. PlayStation 5, Xbox Series X). */
  model: string;
  /** Special edition name (e.g. Final Fantasy XVI Limited Edition). Null if standard. */
  edition: string | null;
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
