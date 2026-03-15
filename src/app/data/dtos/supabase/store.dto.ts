/** Row from the stores table in Supabase. */
export interface StoreDto {
  id: string;
  /** Short unique code (e.g. 'psn', 'amz'). */
  code: string;
  /** Human-readable store name. */
  label: string;
  /** Suggested format for games bought at this store. Null if the store sells both. */
  format_hint: 'digital' | 'physical' | null;
  /** Whether this is a built-in system store. */
  is_system: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Payload for inserting or updating a row in the stores table. */
export type StoreInsertDto = Omit<StoreDto, 'id' | 'created_at' | 'updated_at'>;
