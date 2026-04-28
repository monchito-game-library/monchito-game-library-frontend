import { Injectable, signal, WritableSignal } from '@angular/core';

import { GameFormatType } from '@/types/game-format.type';
import { GameListSortField } from '@/types/game-list-sort-field.type';
import { PlatformType } from '@/types/platform.type';

/**
 * Holds filter and sort state for the games list.
 * Provided at the games route level so state persists while navigating within
 * /collection/games/** (detail, edit) and resets when leaving the section.
 */
@Injectable()
export class GamesFilterService {
  /** Current value of the title search input. */
  readonly searchTerm: WritableSignal<string> = signal('');

  /** Currently selected platform filter, or empty string for no filter. */
  readonly selectedConsole: WritableSignal<'' | PlatformType> = signal<PlatformType | ''>('');

  /** Currently selected store filter, or empty string for no filter. */
  readonly selectedStore: WritableSignal<string> = signal('');

  /** Currently selected status filter, or empty string for no filter. */
  readonly selectedStatus: WritableSignal<string> = signal('');

  /** Currently selected format filter, or empty string for no filter. */
  readonly selectedFormat: WritableSignal<'' | GameFormatType> = signal<'' | GameFormatType>('');

  /** Whether only favourite games are shown. */
  readonly onlyFavorites: WritableSignal<boolean> = signal(false);

  /** Whether only loaned games are shown. */
  readonly onlyLoaned: WritableSignal<boolean> = signal(false);

  /** Field used to sort the game list. */
  readonly sortBy: WritableSignal<GameListSortField> = signal('title');

  /** Sort direction applied to the current sort field. */
  readonly sortDirection: WritableSignal<'asc' | 'desc'> = signal('asc');

  /**
   * Resets all filters to their default empty state.
   * Does not touch sortBy/sortDirection.
   */
  clearAllFilters(): void {
    this.searchTerm.set('');
    this.selectedConsole.set('');
    this.selectedStore.set('');
    this.selectedStatus.set('');
    this.selectedFormat.set('');
    this.onlyFavorites.set(false);
    this.onlyLoaned.set(false);
  }
}
