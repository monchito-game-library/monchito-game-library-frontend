import { ChangeDetectionStrategy, Component, inject, OnDestroy } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { TranslocoPipe } from '@jsverse/transloco';

import { CropDialogDataInterface } from '@/interfaces/crop-dialog-data.interface';
import { CropInteractionBase } from '@/abstract/crop-interaction.base';

@Component({
  selector: 'app-avatar-crop-dialog',
  templateUrl: './avatar-crop-dialog.component.html',
  styleUrl: './avatar-crop-dialog.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatProgressSpinner, TranslocoPipe]
})
export class AvatarCropDialogComponent extends CropInteractionBase implements OnDestroy {
  private readonly _dialogRef: MatDialogRef<AvatarCropDialogComponent, Blob | null> = inject(
    MatDialogRef<AvatarCropDialogComponent, Blob | null>
  );

  /** Cropper configuration received from the parent component. */
  readonly config: CropDialogDataInterface = inject<CropDialogDataInterface>(MAT_DIALOG_DATA);

  /** Object URL pointing to the file being cropped. Revoked on destroy. */
  readonly imageUrl!: string;

  /** Crop area width in px, exposed to the template. */
  readonly cropW!: number;

  /** Crop area height in px, exposed to the template. */
  readonly cropH!: number;

  constructor() {
    super();
    this._cropW = 280;
    this._cropH = Math.round(280 / this.config.aspectRatio);
    this.cropW = this._cropW;
    this.cropH = this._cropH;
    this.imageUrl = URL.createObjectURL(this.config.file);
  }

  ngOnDestroy(): void {
    URL.revokeObjectURL(this.imageUrl);
  }

  /**
   * Crops the image to a blob and closes the dialog with the result.
   */
  async onConfirm(): Promise<void> {
    const blob: Blob | null = await this._cropToBlob();
    this._dialogRef.close(blob);
  }

  /**
   * Cancels the crop and closes the dialog without returning any value.
   */
  onCancel(): void {
    this._dialogRef.close(null);
  }

  /**
   * Draws the visible crop area onto an offscreen canvas and returns the result as a JPEG blob.
   * Uses the same transform-origin + scale + object-position math as the preview rendering.
   */
  private async _cropToBlob(): Promise<Blob | null> {
    const img: HTMLImageElement = this._imgEl!;
    const s: number = this.scale();
    const ox: number = (this.posX() / 100) * this._cropW;
    const oy: number = (this.posY() / 100) * this._cropH;

    const elLeft: number = (ox * (s - 1)) / s;
    const elTop: number = (oy * (s - 1)) / s;
    const elWidth: number = this._cropW / s;
    const elHeight: number = this._cropH / s;

    const rx: number = img.naturalWidth / (this._cropW + this._overflowX);
    const ry: number = img.naturalHeight / (this._cropH + this._overflowY);

    const srcX: number = Math.max(0, (elLeft + (this._overflowX * this.posX()) / 100) * rx);
    const srcY: number = Math.max(0, (elTop + (this._overflowY * this.posY()) / 100) * ry);
    const srcW: number = Math.min(img.naturalWidth - srcX, elWidth * rx);
    const srcH: number = Math.min(img.naturalHeight - srcY, elHeight * ry);

    const outW: number = this.config.resizeToWidth;
    const outH: number = Math.round(this.config.resizeToWidth / this.config.aspectRatio);

    const canvas: HTMLCanvasElement = document.createElement('canvas');
    canvas.width = outW;
    canvas.height = outH;
    const ctx: CanvasRenderingContext2D = canvas.getContext('2d')!;
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, outW, outH);

    return new Promise<Blob | null>((resolve: (value: Blob | null) => void) => {
      canvas.toBlob((blob: Blob | null) => resolve(blob), 'image/jpeg', 0.92);
    });
  }
}
