import { Injectable, signal, WritableSignal } from '@angular/core';

/** Field used to sort the wishlist items. */
export type WishlistSortField = 'priority' | 'title' | 'desiredPrice' | 'createdAt';

/**
 * Holds filter and sort state for the wishlist.
 * Provided at the wishlist route level so state persists while navigating
 * to /wishlist/:id (detail) and resets when leaving the section.
 */
@Injectable()
export class WishlistFilterService {
  /** Current value of the title search input. */
  readonly searchTerm: WritableSignal<string> = signal('');

  /** Selected priority filter. '' = all, otherwise '1'..'5' (1 = highest). */
  readonly selectedPriority: WritableSignal<'' | '1' | '2' | '3' | '4' | '5'> = signal<'' | '1' | '2' | '3' | '4' | '5'>('');

  /** Selected platform filter. '' = all. */
  readonly selectedPlatform: WritableSignal<string> = signal('');

  /** Whether only items with desiredPrice set are shown. */
  readonly onlyWithPrice: WritableSignal<boolean> = signal(false);

  /** Whether only items with notes are shown. */
  readonly onlyWithNotes: WritableSignal<boolean> = signal(false);

  /** Field used to sort the wishlist. */
  readonly sortBy: WritableSignal<WishlistSortField> = signal<WishlistSortField>('priority');

  /** Sort direction applied to the current sort field. */
  readonly sortDirection: WritableSignal<'asc' | 'desc'> = signal('asc');

  /**
   * Resets all filters to their default empty state.
   * Does not touch sortBy/sortDirection.
   */
  clearAllFilters(): void {
    this.searchTerm.set('');
    this.selectedPriority.set('');
    this.selectedPlatform.set('');
    this.onlyWithPrice.set(false);
    this.onlyWithNotes.set(false);
  }

  /**
   * Count of active filters (excludes sort).
   * Used to render the badge on the filter button.
   */
  readonly activeFilterCount = (): number => {
    let count = 0;
    if (this.searchTerm()) count++;
    if (this.selectedPriority()) count++;
    if (this.selectedPlatform()) count++;
    if (this.onlyWithPrice()) count++;
    if (this.onlyWithNotes()) count++;
    return count;
  };
}
