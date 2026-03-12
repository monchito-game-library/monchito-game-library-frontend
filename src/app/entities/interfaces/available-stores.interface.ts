import { StoreType } from '@/types/stores.type';

/** Represents a store option available for selection in the game form. */
export interface AvailableStoresInterface {
  /** Store code (e.g. 'gm-ibe', 'amz'). */
  code: StoreType;
  /** Transloco key for the human-readable store name. */
  labelKey: string;
}
