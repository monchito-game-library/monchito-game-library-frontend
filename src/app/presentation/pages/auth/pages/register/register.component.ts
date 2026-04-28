import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatError, MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe } from '@jsverse/transloco';

import { AUTH_USE_CASES, AuthResult, AuthUseCasesContract } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { OAuthProvider } from '@/types/oauth-provider.type';
import { AuthPanelComponent } from '@/pages/auth/components/auth-panel/auth-panel.component';
import { AuthBaseComponent } from '@/abstract/auth-base/auth-base.component';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
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
    TranslocoPipe,
    AuthPanelComponent
  ]
})
/** Registration page component. Creates a new account and redirects to login on success. */
export class RegisterComponent extends AuthBaseComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _authUseCases: AuthUseCasesContract = inject(AUTH_USE_CASES);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);

  /** Whether the confirm-password field is hidden. */
  readonly hideConfirmPassword: WritableSignal<boolean> = signal<boolean>(true);

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
   * Inicia el flujo OAuth con el proveedor indicado y muestra el error si falla.
   * Si hay un returnUrl activo, lo persiste en sessionStorage para que el guard
   * pueda recuperarlo tras la recarga completa del navegador que hace el callback OAuth.
   *
   * @param {OAuthProvider} provider - Proveedor OAuth seleccionado
   */
  async onOAuthSignIn(provider: OAuthProvider): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl');
    if (returnUrl) {
      sessionStorage.setItem('oauth_return_url', returnUrl);
    }
    const result: AuthResult = await this._authUseCases.signInWithOAuth(provider);
    this.loading.set(false);
    if (!result.success) {
      sessionStorage.removeItem('oauth_return_url');
      this._setError(result.error, 'auth.register.oauthFailed');
    }
  }

  /**
   * Toggles the confirm-password field visibility.
   */
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update((v: boolean) => !v);
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
      this._setSuccess('auth.register.successMessage');
      this._scheduleNavigation(['/auth/login'], 3000);
    } else {
      this._setError(result.error, 'auth.register.registrationFailed');
    }
  }
}
