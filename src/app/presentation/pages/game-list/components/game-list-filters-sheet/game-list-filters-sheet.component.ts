import { ChangeDetectionStrategy, Component, inject, WritableSignal } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { TranslocoPipe } from '@jsverse/transloco';

import { PlatformType } from '@/types/platform.type';
import { GameFormatType } from '@/types/game-format.type';
import { StoreModel } from '@/models/store/store.model';
import { availablePlatformsConstant } from '@/constants/available-platforms.constant';
import { AvailablePlatformInterface } from '@/interfaces/available-platform.interface';
import { availableGameStatuses, GameStatusOption } from '@/constants/game-status.constant';
import { ToggleSwitchComponent } from '@/components/ad-hoc/toggle-switch/toggle-switch.component';

/** Sort field values used by the game list. */
export type GameListSortField = 'created_at' | 'title' | 'price' | 'personal_rating';

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

@Component({
  selector: 'app-game-list-filters-sheet',
  templateUrl: './game-list-filters-sheet.component.html',
  styleUrls: ['./game-list-filters-sheet.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButton,
    MatIconButton,
    MatDivider,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    MatIcon,
    ToggleSwitchComponent,
    TranslocoPipe
  ]
})
export class GameListFiltersSheetComponent {
  private readonly _sheetRef: MatBottomSheetRef<GameListFiltersSheetComponent> = inject(MatBottomSheetRef);

  /** Filter state injected from game-list — mutations are reflected live in the list. */
  readonly data: GameListFiltersSheetData = inject(MAT_BOTTOM_SHEET_DATA);

  /** Available platform options for the console filter. */
  readonly consoles: AvailablePlatformInterface[] = availablePlatformsConstant;

  /** Available status options for the status filter. */
  readonly gameStatuses: GameStatusOption[] = availableGameStatuses;

  /**
   * Closes the bottom sheet without making changes.
   */
  close(): void {
    this._sheetRef.dismiss();
  }

  /**
   * Clears all active filters and closes the sheet.
   */
  onClearAll(): void {
    this.data.clearAllFilters();
    this._sheetRef.dismiss();
  }
}
