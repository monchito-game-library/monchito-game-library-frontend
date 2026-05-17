import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LibButtonComponent } from '@/lib/lib-button/lib-button.component';
import { LibIconButtonComponent } from '@/lib/lib-icon-button/lib-icon-button.component';
import { LibIconComponent } from '@/components/lib/lib-icon/lib-icon.component';
import { LibFormFieldComponent } from '@/lib/lib-form-field/lib-form-field.component';
import { LibInputDirective } from '@/lib/lib-form-field/lib-input.directive';
import { LibLabelComponent } from '@/lib/lib-form-field/lib-label.component';
import { LibErrorComponent } from '@/lib/lib-form-field/lib-error.component';
import { TranslocoPipe } from '@jsverse/transloco';

import { AUTH_USE_CASES, AuthResult, AuthUseCasesContract } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { AuthPanelComponent } from '@/pages/auth/components/auth-panel/auth-panel.component';
import { AuthBaseComponent } from '@/abstract/auth-base/auth-base.component';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    LibIconButtonComponent,
    LibIconComponent,
    TranslocoPipe,
    AuthPanelComponent,
    LibButtonComponent,
    LibFormFieldComponent,
    LibInputDirective,
    LibLabelComponent,
    LibErrorComponent
  ]
})
/** Reset-password page component. Validates the recovery session and updates the user's password. */
export class ResetPasswordComponent extends AuthBaseComponent implements OnInit {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _authUseCases: AuthUseCasesContract = inject(AUTH_USE_CASES);

  /** Whether the recovery session from the email link has been established. */
  readonly recoveryReady: WritableSignal<boolean> = signal<boolean>(false);

  /** Whether the confirm-password field is hidden. */
  readonly hideConfirmPassword: WritableSignal<boolean> = signal<boolean>(true);

  /** Reactive form with new password and confirm-password fields. */
  readonly resetPasswordForm = this._fb.group(
    {
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: this._passwordMatchValidator }
  );

  /**
   * Registers the PASSWORD_RECOVERY listener on init so the form activates
   * as soon as Supabase establishes the recovery session from the email link.
   */
  ngOnInit(): void {
    this._authUseCases.onPasswordRecovery(() => {
      this.recoveryReady.set(true);
    });
  }

  /**
   * Toggles the confirm-password field visibility.
   */
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((v: boolean) => !v);
  }

  /**
   * Validates the form, updates the password, signs out and navigates to login on success.
   */
  async onSubmit(): Promise<void> {
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { password } = this.resetPasswordForm.value;
    const result: AuthResult = await this._authUseCases.updatePassword(password!);

    this.loading.set(false);

    if (result.success) {
      this._setSuccess('auth.resetPassword.successMessage');
      await this._authUseCases.signOut();
      this._scheduleNavigation(['/auth/login'], 2000);
    } else {
      this._setError(result.error, 'auth.resetPassword.updateFailed');
    }
  }
}
