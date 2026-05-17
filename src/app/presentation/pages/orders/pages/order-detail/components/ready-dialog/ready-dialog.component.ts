import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { RetroButtonComponent } from '@/retro/retro-button/retro-button.component';
import { TranslocoPipe } from '@jsverse/transloco';

import { formatBreakdown } from '@/shared/pack-optimizer/pack-optimizer.util';
import { ReadyDialogData } from '@/interfaces/orders/ready-dialog.interface';
import { ReadyDialogResult } from '@/types/ready-dialog-result.type';
import {
  RETRO_DIALOG_DATA,
  RetroDialogActionsDirective,
  RetroDialogContentDirective,
  RetroDialogRef,
  RetroDialogTitleDirective
} from '@/services/retro-dialog/retro-dialog.service';

@Component({
  selector: 'app-ready-dialog',
  templateUrl: './ready-dialog.component.html',
  styleUrl: './ready-dialog.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DecimalPipe,
    RetroDialogTitleDirective,
    RetroDialogContentDirective,
    RetroDialogActionsDirective,
    TranslocoPipe,
    RetroButtonComponent
  ]
})
export class ReadyDialogComponent {
  private readonly _dialogRef: RetroDialogRef<ReadyDialogComponent, ReadyDialogResult | undefined> = inject(
    RetroDialogRef<ReadyDialogComponent, ReadyDialogResult | undefined>
  );

  /** Data injected by the parent: lines with suggestions. */
  readonly data: ReadyDialogData = inject<ReadyDialogData>(RETRO_DIALOG_DATA);

  /** Returns the human-readable breakdown of a suggestion. */
  readonly formatBreakdown = formatBreakdown;

  /**
   * Map of lineId → selected suggestion index (0-based).
   * Defaults to 0 (cheapest option) for every line.
   */
  readonly selectedIndex: WritableSignal<Map<string, number>> = signal<Map<string, number>>(
    new Map(this.data.lines.map((l) => [l.line.id, 0]))
  );

  /**
   * Returns true if all lines have at least one suggestion available.
   */
  canConfirm(): boolean {
    return this.data.lines.every((l) => l.suggestions.length > 0);
  }

  /**
   * Returns the currently selected suggestion index for a given line.
   *
   * @param {string} lineId - UUID of the line
   */
  getSelectedIndex(lineId: string): number {
    return this.selectedIndex().get(lineId) ?? 0;
  }

  /**
   * Updates the selected suggestion index for a given line.
   *
   * @param {string} lineId - UUID of the line
   * @param {number} idx - Index of the chosen suggestion
   */
  onSelectSuggestion(lineId: string, idx: number): void {
    const map = new Map(this.selectedIndex());
    map.set(lineId, idx);
    this.selectedIndex.set(map);
  }

  /**
   * Closes the dialog with the selected pack data for each line.
   */
  onConfirm(): void {
    const result: ReadyDialogResult = this.data.lines.map((lineData) => {
      const idx = this.getSelectedIndex(lineData.line.id);
      const suggestion = lineData.suggestions[idx];
      return {
        lineId: lineData.line.id,
        unitPrice: suggestion.unitPrice,
        quantityOrdered: suggestion.totalUnits
      };
    });
    this._dialogRef.close(result);
  }

  /**
   * Closes the dialog without making any changes.
   */
  onCancel(): void {
    this._dialogRef.close(undefined);
  }
}
