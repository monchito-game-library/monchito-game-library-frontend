import { ChangeDetectionStrategy, Component, inject, OnInit, signal, WritableSignal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';
import { RetroIconButtonComponent } from '@retro/retro-icon-button/retro-icon-button.component';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroInputComponent } from '@retro/retro-input/retro-input.component';
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
    RetroIconButtonComponent,
    RetroIconComponent,
    TranslocoPipe,
    AuthPanelComponent,
    RetroButtonComponent,
    RetroInputComponent
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
   * Devuelve el mensaje de error del campo password, o null si no hay error visible.
   */
  _getPasswordError(): string | null {
    const ctrl = this.resetPasswordForm.get('password');
    if (!ctrl?.touched) return null;
    if (ctrl.hasError('required')) return this._transloco.translate('auth.resetPassword.passwordRequired');
    if (ctrl.hasError('minlength')) return this._transloco.translate('auth.resetPassword.passwordMinLength');
    return null;
  }

  /**
   * Devuelve el mensaje de error del campo confirmPassword.
   * Combina el error de nivel control (required) y el de nivel formulario (passwordMismatch).
   */
  _getConfirmPasswordError(): string | null {
    const ctrl = this.resetPasswordForm.get('confirmPassword');
    if (!ctrl?.touched) return null;
    if (ctrl.hasError('required')) return this._transloco.translate('auth.resetPassword.confirmPasswordRequired');
    if (this.resetPasswordForm.hasError('passwordMismatch'))
      return this._transloco.translate('auth.resetPassword.passwordMismatch');
    return null;
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
