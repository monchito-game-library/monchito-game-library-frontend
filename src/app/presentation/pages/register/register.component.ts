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

import { AuthService } from '@/services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
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
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading: WritableSignal<boolean> = signal(false);
  readonly errorMessage: WritableSignal<string> = signal('');
  readonly successMessage: WritableSignal<string> = signal('');
  readonly hidePassword: WritableSignal<boolean> = signal(true);
  readonly hideConfirmPassword: WritableSignal<boolean> = signal(true);

  readonly registerForm = this.fb.group(
    {
      displayName: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    },
    {
      validators: this.passwordMatchValidator
    }
  );

  /**
   * Validador personalizado para verificar que las contraseñas coincidan
   */
  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');

    if (!password || !confirmPassword) {
      return null;
    }

    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  /**
   * Alterna la visibilidad de confirmar contraseña
   */
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((value) => !value);
  }

  /**
   * Maneja el submit del formulario de registro
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

    const result = await this.authService.signUp({
      email: email!,
      password: password!,
      displayName: displayName!
    });

    this.loading.set(false);

    if (!result.success) {
      this.errorMessage.set(result.error || 'Registration failed');
    } else {
      this.successMessage.set('Registration successful! Please check your email to verify your account.');
      // Opcionalmente redirigir al login después de unos segundos
      setTimeout(() => {
        void this.router.navigate(['/login']);
      }, 3000);
    }
  }

  /**
   * Navega a la página de login
   */
  goToLogin(): void {
    void this.router.navigate(['/login']);
  }
}
