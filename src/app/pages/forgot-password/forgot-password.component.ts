import { Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { MatError, MatFormField, MatLabel, MatPrefix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@ngneat/transloco';

import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
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
    MatProgressSpinner,
    MatIcon,
    MatError,
    MatPrefix,
    TranslocoPipe
  ]
})
export class ForgotPasswordComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading: WritableSignal<boolean> = signal(false);
  readonly errorMessage: WritableSignal<string> = signal('');
  readonly successMessage: WritableSignal<string> = signal('');

  readonly forgotPasswordForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]]
  });

  /**
   * Maneja el submit del formulario de recuperación de contraseña
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

    const result = await this.authService.resetPassword(email!);

    this.loading.set(false);

    if (!result.success) {
      this.errorMessage.set(result.error || 'Failed to send reset email');
    } else {
      this.successMessage.set('Password reset email sent! Please check your inbox.');
      // Redirigir al login después de unos segundos
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
