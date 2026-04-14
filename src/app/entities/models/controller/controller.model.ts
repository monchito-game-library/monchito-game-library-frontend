import { GameConditionType } from '@/types/game-condition.type';
import { ControllerCompatibilityType } from '@/types/controller-compatibility.type';

/** Domain model for a controller owned by the user. */
export interface ControllerModel {
  /** Supabase UUID of the user_controllers row. */
  id: string;
  /** UUID of the owner. */
  userId: string;
  /** UUID of the hardware brand (references hardware_brands). */
  brandId: string;
  /** UUID of the hardware model (references hardware_models). */
  modelId: string;
  /** UUID of the hardware edition (references hardware_editions). Null if standard edition. */
  editionId: string | null;
  /** Main color of the controller. */
  color: string;
  /** Platform compatibility. */
  compatibility: ControllerCompatibilityType;
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
