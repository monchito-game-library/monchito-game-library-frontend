import { WritableSignal } from '@angular/core';

import { WishlistSortField } from '@/types/wishlist-sort-field.type';

/** Data contract passed from the wishlist-list to the filters bottom sheet. */
export interface WishlistListFiltersSheetData {
  searchTerm: WritableSignal<string>;
  selectedPriority: WritableSignal<'' | '1' | '2' | '3' | '4' | '5'>;
  selectedPlatform: WritableSignal<string>;
  onlyWithPrice: WritableSignal<boolean>;
  onlyWithNotes: WritableSignal<boolean>;
  sortBy: WritableSignal<WishlistSortField>;
  sortDirection: WritableSignal<'asc' | 'desc'>;
  clearAllFilters: () => void;
  availablePlatforms: () => string[];
}
