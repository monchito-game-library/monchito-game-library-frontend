import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { TranslocoPipe } from '@jsverse/transloco';

import { CoverPositionDialogDataInterface } from '@/interfaces/cover-position-dialog-data.interface';
import { CropInteractionBase } from '@/abstract/crop-interaction-base/crop-interaction.base';
import { MAX_SCALE, MIN_SCALE } from '@/constants/cover-position.constant';

@Component({
  selector: 'app-game-cover-position-dialog',
  templateUrl: './game-cover-position-dialog.component.html',
  styleUrl: './game-cover-position-dialog.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, TranslocoPipe]
})
export class GameCoverPositionDialogComponent extends CropInteractionBase {
  private readonly _dialogRef: MatDialogRef<GameCoverPositionDialogComponent, string | null> = inject(
    MatDialogRef<GameCoverPositionDialogComponent, string | null>
  );

  /** Dialog configuration including the image URL and initial position. */
  readonly config: CoverPositionDialogDataInterface = inject<CoverPositionDialogDataInterface>(MAT_DIALOG_DATA);

  constructor() {
    super();
    this._cropW = 240;
    this._cropH = 320;

    const pos: string | null = this.config.initialPosition;
    if (pos) {
      const parts: string[] = pos.split(' ');
      if (parts.length >= 2) {
        this.posX.set(parseFloat(parts[0]));
        this.posY.set(parseFloat(parts[1]));
      }
      if (parts.length >= 3) {
        this.scale.set(Math.max(MIN_SCALE, Math.min(MAX_SCALE, parseFloat(parts[2]))));
      }
    }
  }

  /**
   * Closes the dialog and returns the chosen position + scale string.
   */
  onConfirm(): void {
    const x: number = Math.round(this.posX());
    const y: number = Math.round(this.posY());
    const s: string = this.scale().toFixed(2);
    this._dialogRef.close(`${x}% ${y}% ${s}`);
  }

  /**
   * Closes the dialog without returning a value.
   */
  onCancel(): void {
    this._dialogRef.close(null);
  }
}
