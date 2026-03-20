import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatError, MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@ngneat/transloco';

import { AUTH_USE_CASES, AuthResult, AuthUseCasesContract } from '@/domain/use-cases/auth/auth.use-cases.contract';

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
    TranslocoPipe
  ]
})
/** Forgot-password page component. Sends a password-reset email and redirects to login on success. */
export class ForgotPasswordComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _authUseCases: AuthUseCasesContract = inject(AUTH_USE_CASES);
  private readonly _router: Router = inject(Router);

  /** Whether a password-reset request is in progress. */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** Error message to display when the request fails. */
  readonly errorMessage: WritableSignal<string> = signal('');

  /** Success message shown after the reset email is sent. */
  readonly successMessage: WritableSignal<string> = signal('');

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
      this.successMessage.set('Password reset email sent! Please check your inbox.');
      setTimeout(() => void this._router.navigate(['/auth/login']), 3000);
    } else {
      this.errorMessage.set(result.error ?? 'Failed to send reset email');
    }
  }
}
