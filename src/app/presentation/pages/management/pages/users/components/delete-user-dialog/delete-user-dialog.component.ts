import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroInputComponent } from '@retro/retro-input/retro-input.component';
import { TranslocoPipe } from '@jsverse/transloco';

import { DeleteUserDialogForm, DeleteUserDialogInterface } from '@/interfaces/management/delete-user-dialog.interface';
import {
  RETRO_DIALOG_DATA,
  RetroDialogActionsDirective,
  RetroDialogCloseDirective,
  RetroDialogContentDirective,
  RetroDialogRef,
  RetroDialogTitleDirective
} from '@retro/retro-dialog/services/retro-dialog.service';

/**
 * Confirmation dialog for permanently deleting a user.
 *
 * Requires the operator to type the target user's email exactly to enable the
 * confirmation button. Used to prevent accidental destructive actions.
 */
@Component({
  selector: 'app-delete-user-dialog',
  templateUrl: './delete-user-dialog.component.html',
  styleUrl: './delete-user-dialog.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RetroDialogTitleDirective,
    RetroDialogContentDirective,
    RetroDialogActionsDirective,
    RetroDialogCloseDirective,
    RetroIconComponent,
    TranslocoPipe,
    RetroButtonComponent,
    RetroInputComponent
  ]
})
export class DeleteUserDialogComponent {
  /** Data injected into the dialog, containing the target user's email. */
  readonly data: DeleteUserDialogInterface = inject<DeleteUserDialogInterface>(RETRO_DIALOG_DATA);

  /** Reference to this dialog instance, used to close it programmatically. */
  readonly dialogRef: RetroDialogRef<DeleteUserDialogComponent, boolean> = inject(
    RetroDialogRef<DeleteUserDialogComponent, boolean>
  );

  /** Reactive form requiring the operator to type the user's email to confirm. */
  readonly form: FormGroup<DeleteUserDialogForm> = new FormGroup<DeleteUserDialogForm>({
    emailConfirmation: new FormControl<string | null>(null, {
      validators: [Validators.required]
    })
  });

  /** Live signal of the input value. */
  readonly typedEmail: Signal<string | null> = toSignal(this.form.controls.emailConfirmation.valueChanges, {
    initialValue: this.form.controls.emailConfirmation.value
  });

  /** True when the typed email exactly matches the target email. */
  readonly canConfirm: Signal<boolean> = computed((): boolean => (this.typedEmail() ?? '').trim() === this.data.email);

  /**
   * Emits `true` when the user confirms the deletion. Does nothing if the typed
   * email does not match the target.
   */
  onConfirm(): void {
    if (!this.canConfirm()) return;
    this.dialogRef.close(true);
  }
}
