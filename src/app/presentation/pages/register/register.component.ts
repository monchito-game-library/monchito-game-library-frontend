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
export class RegisterComponent {
  private readonly _fb = inject(FormBuilder);
  private readonly _authUseCases: AuthUseCasesContract = inject(AUTH_USE_CASES);
  private readonly _router: Router = inject(Router);

  readonly loading: WritableSignal<boolean> = signal(false);
  readonly errorMessage: WritableSignal<string> = signal('');
  readonly successMessage: WritableSignal<string> = signal('');
  readonly hidePassword: WritableSignal<boolean> = signal(true);
  readonly hideConfirmPassword: WritableSignal<boolean> = signal(true);

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
   * Alterna la visibilidad de la contraseña.
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update((value: boolean) => !value);
  }

  /**
   * Alterna la visibilidad del campo de confirmación de contraseña.
   */
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((value: boolean) => !value);
  }

  /**
   * Valida el formulario, ejecuta el registro y redirige al login tras el éxito.
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
   * Validador que comprueba que los dos campos de contraseña coincidan.
   *
   * @param {AbstractControl} control - Grupo del formulario
   */
  private _passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (!password || !confirmPassword) return null;
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }
}
