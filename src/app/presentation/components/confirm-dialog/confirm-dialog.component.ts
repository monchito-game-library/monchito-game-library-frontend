import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';
import { TranslocoPipe } from '@jsverse/transloco';
import { ConfirmDialogInterface } from '@/interfaces/confirm-dialog.interface';
import {
  RETRO_DIALOG_DATA,
  RetroDialogActionsDirective,
  RetroDialogCloseDirective,
  RetroDialogContentDirective,
  RetroDialogRef,
  RetroDialogTitleDirective
} from '@retro/retro-dialog/services/retro-dialog.service';

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
  imports: [
    RetroDialogTitleDirective,
    RetroDialogContentDirective,
    RetroDialogActionsDirective,
    RetroDialogCloseDirective,
    TranslocoPipe,
    RetroButtonComponent
  ]
})
export class ConfirmDialogComponent {
  /** Data injected into the dialog, containing title and message. */
  data: ConfirmDialogInterface = inject<ConfirmDialogInterface>(RETRO_DIALOG_DATA);

  /** Reference to this dialog instance, used to close it programmatically if needed. */
  dialogRef: RetroDialogRef<ConfirmDialogComponent> = inject(RetroDialogRef<ConfirmDialogComponent>);
}
