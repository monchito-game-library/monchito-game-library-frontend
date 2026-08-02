import { ChangeDetectionStrategy, Component, computed, inject, input, output, Signal } from '@angular/core';
import { RETRO_BOTTOM_SHEET_DATA } from '@retro/retro-bottom-sheet/services/retro-bottom-sheet.service';
import { RETRO_OVERLAY_REF, RetroOverlayRef } from '@retro/retro-overlay/services/retro-overlay.service';
import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';
import { RetroCheckboxComponent } from '@retro/retro-checkbox/retro-checkbox.component';
import { RetroIconButtonComponent } from '@retro/retro-icon-button/retro-icon-button.component';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroOptionComponent } from '@retro/retro-select/components/retro-option/retro-option.component';
import { RetroSelectComponent } from '@retro/retro-select/retro-select.component';
import { TranslocoPipe } from '@jsverse/transloco';

import { WishlistFilterService } from '@/pages/wishlist/services/wishlist-filter.service';

/** Interface shared between bottom-sheet DI and the drawer host. */
export interface WishlistListFiltersSheetData {
  readonly searchTerm: WishlistFilterService['searchTerm'];
  readonly selectedPriority: WishlistFilterService['selectedPriority'];
  readonly selectedPlatform: WishlistFilterService['selectedPlatform'];
  readonly onlyWithPrice: WishlistFilterService['onlyWithPrice'];
  readonly onlyWithNotes: WishlistFilterService['onlyWithNotes'];
  readonly sortBy: WishlistFilterService['sortBy'];
  readonly sortDirection: WishlistFilterService['sortDirection'];
  readonly clearAllFilters: () => void;
  readonly availablePlatforms: () => string[];
}

/**
 * Filter sheet for the wishlist list. Mirrors the games pattern:
 * embedded as drawer on desktop, opened as bottom-sheet on mobile.
 */
@Component({
  selector: 'app-wishlist-list-filters-sheet',
  templateUrl: './wishlist-list-filters-sheet.component.html',
  styleUrls: ['./wishlist-list-filters-sheet.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RetroButtonComponent,
    RetroCheckboxComponent,
    RetroIconButtonComponent,
    RetroIconComponent,
    RetroSelectComponent,
    RetroOptionComponent,
    TranslocoPipe
  ]
})
export class WishlistListFiltersSheetComponent {
  private readonly _sheetRef: RetroOverlayRef | null = inject(RETRO_OVERLAY_REF, { optional: true });
  private readonly _sheetData: WishlistListFiltersSheetData | null = inject(RETRO_BOTTOM_SHEET_DATA, {
    optional: true
  }) as WishlistListFiltersSheetData | null;

  /** Filter state passed when the component is rendered embedded (e.g. inside a drawer). */
  readonly dataInput = input<WishlistListFiltersSheetData | null>(null);

  /** Emitted when the user dismisses the panel; used by the drawer host to close itself. */
  readonly closed = output<void>();

  /** Filter state in use (resolved from BottomSheet DI when opened as sheet, otherwise from input). */
  readonly data: Signal<WishlistListFiltersSheetData> = computed(
    (): WishlistListFiltersSheetData => (this._sheetData ?? this.dataInput()) as WishlistListFiltersSheetData
  );

  /** Priority options for the select. Empty value means "all". */
  readonly priorities: Array<'' | '1' | '2' | '3' | '4' | '5'> = ['', '1', '2', '3', '4', '5'];

  /**
   * Closes the panel: dismisses the bottom sheet when injected as one,
   * otherwise emits `closed` so the embedding host (drawer) can close itself.
   */
  close(): void {
    if (this._sheetRef) {
      this._sheetRef.close();
      return;
    }
    this.closed.emit();
  }

  /**
   * Clears all active filters and closes the panel.
   */
  onClearAll(): void {
    this.data().clearAllFilters();
    this.close();
  }
}
