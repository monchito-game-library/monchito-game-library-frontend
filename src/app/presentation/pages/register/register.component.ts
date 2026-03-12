import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@ngneat/transloco';

import { AUTH_USE_CASES, AuthResult, AuthUseCasesContract } from '@/domain/use-cases/auth/auth.use-cases.contract';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatCard,
    MatCardTitle,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatButton,
    MatIconButton,
    MatProgressSpinner,
    MatIcon,
    MatError,
    MatPrefix,
    MatSuffix,
    TranslocoPipe
  ]
})
/** Registration page component. Creates a new account and redirects to login on success. */
export class RegisterComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _authUseCases: AuthUseCasesContract = inject(AUTH_USE_CASES);
  private readonly _router: Router = inject(Router);

  /** Whether a registration request is in progress. */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** Error message to display when registration fails. */
  readonly errorMessage: WritableSignal<string> = signal('');

  /** Success message shown after a successful registration. */
  readonly successMessage: WritableSignal<string> = signal('');

  /** Whether the password field is hidden. */
  readonly hidePassword: WritableSignal<boolean> = signal(true);

  /** Whether the confirm-password field is hidden. */
  readonly hideConfirmPassword: WritableSignal<boolean> = signal(true);

  /** Reactive registration form with display name, email, password and confirm-password fields. */
  readonly registerForm = this._fb.group(
    {
      displayName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    { validators: this._passwordMatchValidator }
  );

  /**
   * Toggles the password field visibility.
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update((value: boolean) => !value);
  }

  /**
   * Toggles the confirm-password field visibility.
   */
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((value: boolean) => !value);
  }

  /**
   * Validates the form, executes registration and redirects to login on success.
   */
  async onSubmit(): Promise<void> {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.successMessage.set('');

    const { displayName, email, password } = this.registerForm.value;
    const result: AuthResult = await this._authUseCases.signUp(email!, password!, displayName!);

    this.loading.set(false);

    if (result.success) {
      this.successMessage.set('Registration successful! Please check your email to verify your account.');
      setTimeout(() => void this._router.navigate(['/login']), 3000);
    } else {
      this.errorMessage.set(result.error ?? 'Registration failed');
    }
  }

  /**
   * Cross-field validator that checks whether the two password fields match.
   *
   * @param {AbstractControl} control - The form group control
   */
  private _passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (!password || !confirmPassword) return null;
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }
}
