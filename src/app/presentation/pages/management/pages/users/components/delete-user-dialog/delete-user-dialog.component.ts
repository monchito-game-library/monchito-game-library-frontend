import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle
} from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatFormField, MatLabel, MatHint } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

import { DeleteUserDialogForm, DeleteUserDialogInterface } from '@/interfaces/management/delete-user-dialog.interface';

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
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatButton,
    MatFormField,
    MatLabel,
    MatHint,
    MatInput,
    MatIcon,
    TranslocoPipe
  ]
})
export class DeleteUserDialogComponent {
  /** Data injected into the dialog, containing the target user's email. */
  readonly data: DeleteUserDialogInterface = inject<DeleteUserDialogInterface>(MAT_DIALOG_DATA);

  /** Reference to this dialog instance, used to close it programmatically. */
  readonly dialogRef: MatDialogRef<DeleteUserDialogComponent, boolean> = inject(
    MatDialogRef<DeleteUserDialogComponent, boolean>
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
