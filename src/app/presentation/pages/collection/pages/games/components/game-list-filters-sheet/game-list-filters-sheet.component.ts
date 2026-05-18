import { ChangeDetectionStrategy, Component, computed, inject, input, output, Signal } from '@angular/core';
import { RETRO_BOTTOM_SHEET_DATA } from '@retro/retro-bottom-sheet/services/retro-bottom-sheet.service';
import { RETRO_OVERLAY_REF, RetroOverlayRef } from '@retro/retro-overlay/services/retro-overlay.service';
import { RetroIconButtonComponent } from '@retro/retro-icon-button/retro-icon-button.component';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroFormFieldComponent } from '@retro/retro-form-field/retro-form-field.component';
import { RetroLabelComponent } from '@retro/retro-form-field/components/retro-label/retro-label.component';
import { RetroSelectComponent } from '@retro/retro-select/retro-select.component';
import { RetroOptionComponent } from '@retro/retro-select/components/retro-option/retro-option.component';
import { TranslocoPipe } from '@jsverse/transloco';

import { availablePlatformsConstant } from '@/constants/available-platforms.constant';
import { AvailablePlatformInterface } from '@/interfaces/available-platform.interface';
import { availableGameStatuses } from '@/constants/game-status.constant';
import { GameStatusOption } from '@/interfaces/game-status-option.interface';
import { RetroCheckboxComponent } from '@retro/retro-checkbox/retro-checkbox.component';
import { GameListFiltersSheetData } from '@/interfaces/game-list-filters-sheet.interface';
import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';

@Component({
  selector: 'app-game-list-filters-sheet',
  templateUrl: './game-list-filters-sheet.component.html',
  styleUrls: ['./game-list-filters-sheet.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RetroButtonComponent,
    RetroIconButtonComponent,
    RetroIconComponent,
    RetroCheckboxComponent,
    TranslocoPipe,
    RetroFormFieldComponent,
    RetroLabelComponent,
    RetroSelectComponent,
    RetroOptionComponent
  ]
})
export class GameListFiltersSheetComponent {
  private readonly _sheetRef: RetroOverlayRef | null = inject(RETRO_OVERLAY_REF, { optional: true });
  private readonly _sheetData: GameListFiltersSheetData | null = inject(RETRO_BOTTOM_SHEET_DATA, {
    optional: true
  }) as GameListFiltersSheetData | null;

  /** Filter state passed when the component is rendered embedded (e.g. inside a drawer). */
  readonly dataInput = input<GameListFiltersSheetData | null>(null);

  /** Emitted when the user dismisses the panel; used by the drawer host to close itself. */
  readonly closed = output<void>();

  /** Filter state in use (resolved from BottomSheet DI when opened as sheet, otherwise from input). */
  readonly data: Signal<GameListFiltersSheetData> = computed(
    (): GameListFiltersSheetData => (this._sheetData ?? this.dataInput()) as GameListFiltersSheetData
  );

  /** Available platform options for the console filter. */
  readonly consoles: AvailablePlatformInterface[] = availablePlatformsConstant;

  /** Available status options for the status filter. */
  readonly gameStatuses: GameStatusOption[] = availableGameStatuses;

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
