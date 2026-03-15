/** Row from the stores table in Supabase. */
export interface StoreDto {
  id: string;
  /** Human-readable store name. */
  label: string;
  /** Suggested format for games bought at this store. Null if the store sells both. */
  format_hint: 'digital' | 'physical' | null;
  /** UUID of the user who created this store. Used for traceability and future RLS. */
  created_by: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Payload for inserting or updating a row in the stores table. */
export type StoreInsertDto = Omit<StoreDto, 'id' | 'created_at' | 'updated_at'>;
