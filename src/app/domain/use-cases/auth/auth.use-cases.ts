import { inject, Injectable } from '@angular/core';

import { AUTH_REPOSITORY, AuthRepositoryContract } from '@/domain/repositories/auth.repository.contract';
import { AuthUserModel } from '@/models/auth/auth-user.model';
import { OAuthProvider } from '@/types/oauth-provider.type';
import { AuthResult, AuthUseCasesContract } from './auth.use-cases.contract';

@Injectable()
export class AuthUseCasesImpl implements AuthUseCasesContract {
  private readonly _repo: AuthRepositoryContract = inject(AUTH_REPOSITORY);

  /**
   * Returns the currently active session user, or null if unauthenticated.
   */
  async getSession(): Promise<AuthUserModel | null> {
    return this._repo.getSession();
  }

  /**
   * Registers a listener that is called whenever the auth state changes.
   *
   * @param {(user: AuthUserModel | null) => void} callback
   */
  onAuthStateChange(callback: (user: AuthUserModel | null) => void): void {
    this._repo.onAuthStateChange(callback);
  }

  /**
   * Signs in with email and password.
   *
   * @param {string} email - Dirección de email del usuario
   * @param {string} password - Contraseña en texto plano
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      await this._repo.signIn(email, password);
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  }

  /**
   * Creates a new user account.
   *
   * @param {string} email - Dirección de email del usuario
   * @param {string} password - Contraseña en texto plano
   * @param {string} [displayName]
   */
  async signUp(email: string, password: string, displayName?: string): Promise<AuthResult> {
    try {
      await this._repo.signUp(email, password, displayName);
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    }
  }

  /**
   * Signs out the current user.
   */
  async signOut(): Promise<void> {
    await this._repo.signOut();
  }

  /**
   * Sends a password-reset email to the given address.
   *
   * @param {string} email - Dirección de email del usuario
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      await this._repo.resetPassword(email);
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send reset email' };
    }
  }

  /**
   * Updates the authenticated user's display name in auth metadata.
   * Triggers onAuthStateChange internally, updating the reactive state automatically.
   *
   * @param {string} displayName - New display name
   */
  async updateDisplayName(displayName: string): Promise<void> {
    await this._repo.updateDisplayName(displayName);
  }

  /**
   * Updates the authenticated user's password. Wraps the error in an AuthResult.
   *
   * @param {string} newPassword - New password in plain text
   */
  async updatePassword(newPassword: string): Promise<AuthResult> {
    try {
      await this._repo.updatePassword(newPassword);
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to update password' };
    }
  }

  /**
   * Registers a listener that fires when Supabase detects a PASSWORD_RECOVERY session.
   *
   * @param {() => void} callback - Called once the recovery session is established
   */
  onPasswordRecovery(callback: () => void): void {
    this._repo.onPasswordRecovery(callback);
  }

  /**
   * Initiates an OAuth sign-in flow. Redirects the browser to the provider's auth page.
   * Returns { success: false, error } if the redirect cannot be initiated.
   *
   * @param {OAuthProvider} provider - OAuth provider to use
   */
  async signInWithOAuth(provider: OAuthProvider): Promise<AuthResult> {
    try {
      await this._repo.signInWithOAuth(provider);
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'OAuth sign-in failed' };
    }
  }
}
