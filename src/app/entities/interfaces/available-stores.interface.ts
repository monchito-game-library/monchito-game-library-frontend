/** Represents a store option available for selection in the game form. */
export interface AvailableStoresInterface {
  /** Store code (e.g. 'gm-ibe', 'amz'). System stores match StoreType; custom stores may use arbitrary strings. */
  code: string;
  /** Transloco key or direct label for the human-readable store name. */
  labelKey: string;
}
