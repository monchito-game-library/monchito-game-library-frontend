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
  // --- Inyecciones privadas ---
  private readonly _dialogRef: MatDialogRef<AvatarCropDialogComponent, Blob | null> = inject(MatDialogRef);

  // --- Variables privadas ---
  private _croppedBlob: Blob | null = null;

  // --- Variables públicas readonly ---
  /** Configuración del cropper recibida desde el componente padre. */
  readonly config: CropDialogDataInterface = inject<CropDialogDataInterface>(MAT_DIALOG_DATA);

  // --- Signals públicos ---
  /** Indica si la imagen del cropper ha terminado de cargar. */
  readonly imageLoaded: WritableSignal<boolean> = signal(false);

  /**
   * Almacena el blob resultante cada vez que el cropper actualiza el recorte.
   *
   * @param {ImageCroppedEvent} event - Evento con el blob recortado
   */
  onImageCropped(event: ImageCroppedEvent): void {
    this._croppedBlob = event.blob ?? null;
  }

  /**
   * Marca la imagen como cargada para mostrar los controles del dialog.
   */
  onImageLoaded(): void {
    this.imageLoaded.set(true);
  }

  /**
   * Cierra el dialog devolviendo el blob recortado al padre.
   */
  onConfirm(): void {
    this._dialogRef.close(this._croppedBlob);
  }

  /**
   * Cancela el recorte y cierra el dialog sin devolver ningún valor.
   */
  onCancel(): void {
    this._dialogRef.close(null);
  }
}
