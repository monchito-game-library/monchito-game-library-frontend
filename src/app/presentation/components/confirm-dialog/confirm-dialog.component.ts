import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';

/**
 * Reusable confirmation dialog component.
 * Displays a message and two buttons to accept or cancel an action.
 *
 * Typically used to confirm destructive actions such as deleting an item.
 */
@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrl: './confirm-dialog.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatButton, MatDialogClose]
})
export class ConfirmDialogComponent {
  /** Data injected into the dialog, containing title and message. */
  data: ConfirmDialogInterface = inject<ConfirmDialogInterface>(MAT_DIALOG_DATA);

  /** Reference to this dialog instance, used to close it programmatically if needed. */
  dialogRef: MatDialogRef<any, any> = inject(MatDialogRef<ConfirmDialogComponent>);
}
