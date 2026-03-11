import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
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
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading: WritableSignal<boolean> = signal(false);
  readonly errorMessage: WritableSignal<string> = signal('');
  readonly hidePassword: WritableSignal<boolean> = signal(true);

  readonly loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  /**
   * Alterna la visibilidad de la contraseña
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update((value) => !value);
  }

  /**
   * Maneja el submit del formulario de login
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;

    const result = await this.authService.signIn({
      email: email!,
      password: password!
    });

    this.loading.set(false);

    if (!result.success) {
      this.errorMessage.set(result.error || 'Login failed');
    }
    // Si es exitoso, AuthService ya navega al home
  }

  /**
   * Navega a la página de registro
   */
  goToRegister(): void {
    void this.router.navigate(['/register']);
  }

  /**
   * Navega a la página de recuperación de contraseña
   */
  goToForgotPassword(): void {
    void this.router.navigate(['/forgot-password']);
  }
}
