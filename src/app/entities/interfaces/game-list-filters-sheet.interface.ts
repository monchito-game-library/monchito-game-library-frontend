import { WritableSignal } from '@angular/core';

import { PlatformType } from '@/types/platform.type';
import { GameFormatType } from '@/types/game-format.type';
import { GameListSortField } from '@/types/game-list-sort-field.type';
import { StoreModel } from '@/models/store/store.model';

/** Data contract passed from game-list to the filters bottom sheet. */
export interface GameListFiltersSheetData {
  selectedConsole: WritableSignal<'' | PlatformType>;
  selectedStore: WritableSignal<string>;
  selectedStatus: WritableSignal<string>;
  selectedFormat: WritableSignal<'' | GameFormatType>;
  onlyFavorites: WritableSignal<boolean>;
  sortBy: WritableSignal<GameListSortField>;
  sortDirection: WritableSignal<'asc' | 'desc'>;
  stores: WritableSignal<StoreModel[]>;
  clearAllFilters: () => void;
}
