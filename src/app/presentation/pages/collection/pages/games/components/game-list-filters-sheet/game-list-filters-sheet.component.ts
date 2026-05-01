import { ChangeDetectionStrategy, Component, computed, inject, input, output, Signal } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatOption } from '@angular/material/core';
import { MatDivider } from '@angular/material/divider';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect } from '@angular/material/select';
import { TranslocoPipe } from '@jsverse/transloco';

import { availablePlatformsConstant } from '@/constants/available-platforms.constant';
import { AvailablePlatformInterface } from '@/interfaces/available-platform.interface';
import { availableGameStatuses } from '@/constants/game-status.constant';
import { GameStatusOption } from '@/interfaces/game-status-option.interface';
import { ToggleSwitchComponent } from '@/components/ad-hoc/toggle-switch/toggle-switch.component';
import { GameListFiltersSheetData } from '@/interfaces/game-list-filters-sheet.interface';

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
  private readonly _sheetRef: MatBottomSheetRef<GameListFiltersSheetComponent> | null = inject(MatBottomSheetRef, {
    optional: true
  });
  private readonly _sheetData: GameListFiltersSheetData | null = inject(MAT_BOTTOM_SHEET_DATA, { optional: true });

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
      this._sheetRef.dismiss();
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
