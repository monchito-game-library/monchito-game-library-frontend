import { ConsoleSpecsCategoryType } from '@/types/console-specs-category.type';
import { HardwareModelType } from '@/types/hardware-model.type';

/** Domain model for a hardware model entry (e.g. PlayStation 5, Xbox Series X). */
export interface HardwareModelModel {
  /** Supabase UUID. */
  id: string;
  /** UUID of the parent brand. */
  brandId: string;
  /** Human-readable model name. */
  name: string;
  /** Whether this model is a console or a controller. */
  type: HardwareModelType;
  /** Console/controller generation (5th, 6th… 9th). Null if not applicable. */
  generation: number | null;
  /** Console category (home, portable, hybrid). Null for controllers or when specs are not loaded. */
  category: ConsoleSpecsCategoryType | null;
}
