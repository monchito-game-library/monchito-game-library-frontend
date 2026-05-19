import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RetroButtonComponent } from '@retro/retro-button/retro-button.component';
import { RetroIconButtonComponent } from '@retro/retro-icon-button/retro-icon-button.component';
import { RetroIconComponent } from '@retro/retro-icon/retro-icon.component';
import { RetroInputComponent } from '@retro/retro-input/retro-input.component';
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
    RetroIconButtonComponent,
    RetroIconComponent,
    TranslocoPipe,
    AuthPanelComponent,
    RetroButtonComponent,
    RetroInputComponent
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
   * El `returnUrl` viaja como parte del `redirectTo` que recibe Supabase, por lo que el
   * navegador aterriza directamente en el destino tras el callback (sin sessionStorage).
   *
   * @param {OAuthProvider} provider - Proveedor OAuth seleccionado
   */
  async onOAuthSignIn(provider: OAuthProvider): Promise<void> {
    this.loading.set(true);
    this.errorMessage.set('');
    const result: AuthResult = await this._authUseCases.signInWithOAuth(provider, this.returnUrl);
    this.loading.set(false);
    if (!result.success) {
      this._setError(result.error, 'auth.login.oauthFailed');
    }
  }

  /**
   * Devuelve el mensaje de error del campo email, o null si no hay error visible.
   */
  _getEmailError(): string | null {
    const ctrl = this.loginForm.get('email');
    if (!ctrl?.touched) return null;
    if (ctrl.hasError('required')) return this._transloco.translate('auth.login.emailRequired');
    if (ctrl.hasError('email')) return this._transloco.translate('auth.login.emailInvalid');
    return null;
  }

  /**
   * Devuelve el mensaje de error del campo password, o null si no hay error visible.
   */
  _getPasswordError(): string | null {
    const ctrl = this.loginForm.get('password');
    if (!ctrl?.touched) return null;
    if (ctrl.hasError('required')) return this._transloco.translate('auth.login.passwordRequired');
    if (ctrl.hasError('minlength')) return this._transloco.translate('auth.login.passwordMinLength');
    return null;
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
