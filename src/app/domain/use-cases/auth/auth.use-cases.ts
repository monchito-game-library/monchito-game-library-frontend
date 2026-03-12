import { inject, Injectable } from '@angular/core';

import { AUTH_REPOSITORY, AuthRepositoryContract } from '@/domain/repositories/auth.repository.contract';
import { AuthUserModel } from '@/models/auth/auth-user.model';
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
   * @param {string} email
   * @param {string} password
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
   * @param {string} email
   * @param {string} password
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
   * @param {string} email
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      await this._repo.resetPassword(email);
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: error instanceof Error ? error.message : 'Failed to send reset email' };
    }
  }
}
