import { Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { ConfirmDialogInterface } from '../../models/interfaces/confirm-dialog.interface';

/**
 * Componente de diálogo de confirmación reutilizable.
 * Muestra un mensaje y dos botones para aceptar o cancelar una acción.
 *
 * Se utiliza típicamente para confirmar acciones destructivas como eliminar un elemento.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatDialogClose],
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss'
})
export class ConfirmDialogComponent {
  /**
   * Datos recibidos por el diálogo, incluyendo título y mensaje.
   */
  data: ConfirmDialogInterface = inject<ConfirmDialogInterface>(MAT_DIALOG_DATA);

  /**
   * Referencia al diálogo para poder cerrarlo manualmente si es necesario.
   */
  dialogRef: MatDialogRef<any, any> = inject(MatDialogRef<ConfirmDialogComponent>);
}
