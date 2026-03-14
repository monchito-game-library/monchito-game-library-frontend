import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { ImageCropperComponent, ImageCroppedEvent } from 'ngx-image-cropper';
import { CropDialogDataInterface } from '@/interfaces/crop-dialog-data.interface';

@Component({
  selector: 'app-avatar-crop-dialog',
  templateUrl: './avatar-crop-dialog.component.html',
  styleUrl: './avatar-crop-dialog.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatProgressSpinner, ImageCropperComponent]
})
export class AvatarCropDialogComponent {
  private readonly _dialogRef: MatDialogRef<AvatarCropDialogComponent, Blob | null> = inject(MatDialogRef);

  private _croppedBlob: Blob | null = null;

  /** Cropper configuration received from the parent component. */
  readonly config: CropDialogDataInterface = inject<CropDialogDataInterface>(MAT_DIALOG_DATA);

  /** Whether the cropper image has finished loading. */
  readonly imageLoaded: WritableSignal<boolean> = signal(false);

  /**
   * Stores the resulting blob each time the cropper updates the crop area.
   *
   * @param {ImageCroppedEvent} event - Event containing the cropped blob
   */
  onImageCropped(event: ImageCroppedEvent): void {
    this._croppedBlob = event.blob ?? null;
  }

  /**
   * Marks the image as loaded so that the dialog controls are displayed.
   */
  onImageLoaded(): void {
    this.imageLoaded.set(true);
  }

  /**
   * Closes the dialog and returns the cropped blob to the parent.
   */
  onConfirm(): void {
    this._dialogRef.close(this._croppedBlob);
  }

  /**
   * Cancels the crop and closes the dialog without returning any value.
   */
  onCancel(): void {
    this._dialogRef.close(null);
  }
}
