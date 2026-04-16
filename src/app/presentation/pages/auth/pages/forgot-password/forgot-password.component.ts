import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MatError, MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

import { AUTH_USE_CASES, AuthResult, AuthUseCasesContract } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { AuthPanelComponent } from '@/pages/auth/components/auth-panel/auth-panel.component';
import { AuthBaseComponent } from '@/abstract/auth-base.component';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatProgressSpinner,
    MatIcon,
    MatError,
    MatPrefix,
    TranslocoPipe,
    AuthPanelComponent
  ]
})
/** Forgot-password page component. Sends a password-reset email and redirects to login on success. */
export class ForgotPasswordComponent extends AuthBaseComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _authUseCases: AuthUseCasesContract = inject(AUTH_USE_CASES);

  /** Reactive form with a single email field. */
  readonly forgotPasswordForm = this._fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  /**
   * Validates the form, sends the password-reset email and redirects to login on success.
   */
  async onSubmit(): Promise<void> {
    if (this.forgotPasswordForm.invalid) {
      this.forgotPasswordForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { email } = this.forgotPasswordForm.value;
    const result: AuthResult = await this._authUseCases.resetPassword(email!);

    this.loading.set(false);

    if (result.success) {
      this._setSuccess('auth.forgotPassword.successMessage');
      this._scheduleNavigation(['/auth/login'], 3000);
    } else {
      this._setError(result.error, 'auth.forgotPassword.sendFailed');
    }
  }
}
