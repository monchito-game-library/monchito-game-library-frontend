import { GameFormatType } from '@/types/game-format.type';

/** Domain model for a store entry in the user's library. */
export interface StoreModel {
  /** Supabase UUID. */
  id: string;
  /** Short unique code used to reference this store (e.g. 'psn', 'amz'). */
  code: string;
  /** Human-readable store name. */
  label: string;
  /** Suggested game format for this store. Null when the store sells both. */
  formatHint: GameFormatType | null;
  /** Whether this is a built-in system store (non-deletable). */
  isSystem: boolean;
}
