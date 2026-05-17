import { ChangeDetectionStrategy, Component, computed, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LibButtonComponent } from '@/lib/lib-button/lib-button.component';
import { LibIconComponent } from '@/components/lib/lib-icon/lib-icon.component';
import { LibFormFieldComponent } from '@/lib/lib-form-field/lib-form-field.component';
import { LibInputDirective } from '@/lib/lib-form-field/lib-input.directive';
import { LibLabelComponent } from '@/lib/lib-form-field/lib-label.component';
import { LibHintComponent } from '@/lib/lib-form-field/lib-hint.component';
import { TranslocoPipe } from '@jsverse/transloco';

import { DeleteUserDialogForm, DeleteUserDialogInterface } from '@/interfaces/management/delete-user-dialog.interface';
import {
  LIB_DIALOG_DATA,
  LibDialogActionsDirective,
  LibDialogCloseDirective,
  LibDialogContentDirective,
  LibDialogRef,
  LibDialogTitleDirective
} from '@/services/lib-dialog/lib-dialog.service';

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
    LibDialogTitleDirective,
    LibDialogContentDirective,
    LibDialogActionsDirective,
    LibDialogCloseDirective,
    LibIconComponent,
    TranslocoPipe,
    LibButtonComponent,
    LibFormFieldComponent,
    LibInputDirective,
    LibLabelComponent,
    LibHintComponent
  ]
})
export class DeleteUserDialogComponent {
  /** Data injected into the dialog, containing the target user's email. */
  readonly data: DeleteUserDialogInterface = inject<DeleteUserDialogInterface>(LIB_DIALOG_DATA);

  /** Reference to this dialog instance, used to close it programmatically. */
  readonly dialogRef: LibDialogRef<DeleteUserDialogComponent, boolean> = inject(
    LibDialogRef<DeleteUserDialogComponent, boolean>
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
