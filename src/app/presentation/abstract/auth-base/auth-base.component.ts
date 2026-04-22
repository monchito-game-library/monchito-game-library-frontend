import { inject, signal, WritableSignal } from '@angular/core';
import { AbstractControl, FormControl, FormGroupDirective, NgForm, ValidationErrors } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { Router } from '@angular/router';
import { TranslocoService } from '@jsverse/transloco';

/** ErrorStateMatcher that also marks confirmPassword as invalid when the parent group has passwordMismatch. */
export class PasswordMismatchErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const controlInvalid = !!(control?.invalid && control?.touched);
    const groupMismatch = !!(control?.parent?.hasError('passwordMismatch') && control?.touched);
    return controlInvalid || groupMismatch;
  }
}

/**
 * Abstract base class that encapsulates the shared state and helper methods
 * common to all auth page components (login, register, forgot-password, reset-password).
 *
 * Subclasses inherit the loading/error/success signals, password visibility toggle,
 * and protected helpers for error handling, success feedback and scheduled navigation.
 */
export abstract class AuthBaseComponent {
  protected readonly _router: Router = inject(Router);
  private readonly _transloco: TranslocoService = inject(TranslocoService);

  /** Whether an auth request is in progress. */
  readonly loading: WritableSignal<boolean> = signal<boolean>(false);

  /** Error message to display when the request fails. */
  readonly errorMessage: WritableSignal<string> = signal<string>('');

  /** Success message shown after a successful operation. */
  readonly successMessage: WritableSignal<string> = signal<string>('');

  /** Whether the password field is hidden. */
  readonly hidePassword: WritableSignal<boolean> = signal<boolean>(true);

  /** ErrorStateMatcher used by confirmPassword fields to surface group-level passwordMismatch errors. */
  readonly passwordMismatchMatcher = new PasswordMismatchErrorStateMatcher();

  /**
   * Toggles the password field visibility.
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update((v: boolean) => !v);
  }

  /**
   * Sets the error message from an auth result, falling back to a translation key.
   *
   * @param {string | undefined} error - The error message returned by the use case
   * @param {string} fallbackKey - Translation key used when no error message is provided
   */
  protected _setError(error: string | undefined, fallbackKey: string): void {
    this.errorMessage.set(error ?? this._transloco.translate(fallbackKey));
  }

  /**
   * Sets the success message using a translation key.
   *
   * @param {string} key - Translation key for the success message
   */
  protected _setSuccess(key: string): void {
    this.successMessage.set(this._transloco.translate(key));
  }

  /**
   * Schedules navigation to the given route after a delay.
   *
   * @param {string[]} path - Route segments to navigate to
   * @param {number} ms - Delay in milliseconds
   */
  protected _scheduleNavigation(path: string[], ms: number): void {
    setTimeout(() => void this._router.navigate(path), ms);
  }

  /**
   * Cross-field validator that checks whether the password and confirmPassword fields match.
   *
   * @param {AbstractControl} control - The form group control
   */
  protected _passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password');
    const confirmPassword = control.get('confirmPassword');
    if (!password || !confirmPassword) return null;
    return password.value === confirmPassword.value ? null : { passwordMismatch: true };
  }
}
