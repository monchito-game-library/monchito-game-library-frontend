import { InjectionToken } from '@angular/core';
import { AuthUserModel } from '@/models/auth/auth-user.model';

/** Contract for the authentication repository. */
export interface AuthRepositoryContract {
  /**
   * Returns the authenticated user from the active session, or null if there is none.
   */
  getSession(): Promise<AuthUserModel | null>;

  /**
   * Signs in with email and password. Throws if the credentials are invalid.
   *
   * @param {string} email - Dirección de email del usuario
   * @param {string} password - Contraseña en texto plano
   */
  signIn(email: string, password: string): Promise<AuthUserModel>;

  /**
   * Creates a new user account.
   *
   * @param {string} email - Dirección de email del usuario
   * @param {string} password - Contraseña en texto plano
   * @param {string} [displayName]
   */
  signUp(email: string, password: string, displayName?: string): Promise<AuthUserModel>;

  /**
   * Signs out the current user.
   */
  signOut(): Promise<void>;

  /**
   * Sends a password-reset email.
   *
   * @param {string} email - Dirección de email del usuario
   */
  resetPassword(email: string): Promise<void>;

  /**
   * Registers a listener that fires on every auth state change.
   * The callback receives null when the user signs out or the session expires.
   *
   * @param {(user: AuthUserModel | null) => void} callback
   */
  onAuthStateChange(callback: (user: AuthUserModel | null) => void): void;

  /**
   * Updates the display name stored in the user's auth metadata.
   *
   * @param {string} displayName - New display name (may include emojis)
   */
  updateDisplayName(displayName: string): Promise<void>;
}

/** InjectionToken for AuthRepositoryContract. */
export const AUTH_REPOSITORY = new InjectionToken<AuthRepositoryContract>('AUTH_REPOSITORY');
