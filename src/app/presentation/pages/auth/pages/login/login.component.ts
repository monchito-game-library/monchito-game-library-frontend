import { ChangeDetectionStrategy, Component, inject, signal, WritableSignal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatError, MatFormField, MatLabel, MatPrefix, MatSuffix } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatIcon } from '@angular/material/icon';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { AUTH_USE_CASES, AuthResult, AuthUseCasesContract } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { AuthPanelComponent } from '@/pages/auth/components/auth-panel/auth-panel.component';

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
export class LoginComponent {
  private readonly _fb: FormBuilder = inject(FormBuilder);
  private readonly _authUseCases: AuthUseCasesContract = inject(AUTH_USE_CASES);
  private readonly _router: Router = inject(Router);
  private readonly _route: ActivatedRoute = inject(ActivatedRoute);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  /** Whether a login request is in progress. */
  readonly loading: WritableSignal<boolean> = signal(false);

  /** Error message to display when login fails. */
  readonly errorMessage: WritableSignal<string> = signal('');

  /** Whether the password field is hidden. */
  readonly hidePassword: WritableSignal<boolean> = signal(true);

  /** Reactive login form with email and password fields. */
  readonly loginForm = this._fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  /**
   * Toggles the password field visibility.
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update((value: boolean) => !value);
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
      const returnUrl = this._route.snapshot.queryParamMap.get('returnUrl') ?? '/collection';
      void this._router.navigateByUrl(returnUrl);
    } else {
      this.errorMessage.set(result.error ?? this._transloco.translate('auth.login.loginFailed'));
    }
  }
}
