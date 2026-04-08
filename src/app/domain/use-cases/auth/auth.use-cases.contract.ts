import { InjectionToken } from '@angular/core';
import { AuthUserModel } from '@/models/auth/auth-user.model';

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface AuthUseCasesContract {
  /**
   * Returns the currently active session user, or null if unauthenticated.
   */
  getSession(): Promise<AuthUserModel | null>;

  /**
   * Registers a listener that is called whenever the auth state changes.
   * The callback receives null when the user signs out.
   *
   * @param {(user: AuthUserModel | null) => void} callback
   */
  onAuthStateChange(callback: (user: AuthUserModel | null) => void): void;

  /**
   * Signs in with email and password.
   *
   * @param {string} email - Dirección de email del usuario
   * @param {string} password - Contraseña en texto plano
   */
  signIn(email: string, password: string): Promise<AuthResult>;

  /**
   * Registers a new user.
   *
   * @param {string} email - Dirección de email del usuario
   * @param {string} password - Contraseña en texto plano
   * @param {string} [displayName]
   */
  signUp(email: string, password: string, displayName?: string): Promise<AuthResult>;

  /**
   * Signs out the current user.
   */
  signOut(): Promise<void>;

  /**
   * Sends a password-reset email.
   *
   * @param {string} email - Dirección de email del usuario
   */
  resetPassword(email: string): Promise<AuthResult>;

  /**
   * Updates the authenticated user's display name.
   *
   * @param {string} displayName - New display name (may include emojis)
   */
  updateDisplayName(displayName: string): Promise<void>;
}

export const AUTH_USE_CASES = new InjectionToken<AuthUseCasesContract>('AUTH_USE_CASES');
