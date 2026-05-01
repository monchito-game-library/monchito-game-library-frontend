import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
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
/** Login page component. Handles user authentication and redirects to the game list on success. */
export class LoginComponent extends AuthBaseComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _authUseCases: AuthUseCasesContract = inject(AUTH_USE_CASES);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);

  /** returnUrl recibido por query param. Se propaga al link de registro y al éxito de signIn. */
  readonly returnUrl: string | null = this._route.snapshot.queryParamMap.get('returnUrl');

  /** Reactive login form with email and password fields. */
  readonly loginForm = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

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
    if (this.returnUrl) {
      sessionStorage.setItem('oauth_return_url', this.returnUrl);
    }
    const result: AuthResult = await this._authUseCases.signInWithOAuth(provider);
    this.loading.set(false);
    if (!result.success) {
      sessionStorage.removeItem('oauth_return_url');
      this._setError(result.error, 'auth.login.oauthFailed');
    }
  }

  /**
   * Validates the form, executes login and navigates to the game collection on success.
   */
  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');

    const { email, password } = this.loginForm.value;
    const result: AuthResult = await this._authUseCases.signIn(email!, password!);

    this.loading.set(false);

    if (result.success) {
      void this._router.navigateByUrl(this.returnUrl ?? '/collection');
    } else {
      this._setError(result.error, 'auth.login.loginFailed');
    }
  }
}
