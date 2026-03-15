import { GameFormatType } from '@/types/game-format.type';

/** Domain model for a store entry shared across all users. */
export interface StoreModel {
  /** Supabase UUID. */
  id: string;
  /** Human-readable store name. */
  label: string;
  /** Suggested game format for this store. Null when the store sells both. */
  formatHint: GameFormatType | null;
}
