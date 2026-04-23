import { InjectionToken } from '@angular/core';
import { AuthUserModel } from '@/models/auth/auth-user.model';
import { OAuthProvider } from '@/types/oauth-provider.type';

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

  /**
   * Updates the password of the currently authenticated user.
   * Must be called while a PASSWORD_RECOVERY session is active.
   *
   * @param {string} newPassword - New password in plain text
   */
  updatePassword(newPassword: string): Promise<void>;

  /**
   * Registers a one-time listener that fires when Supabase detects a PASSWORD_RECOVERY
   * session (i.e. the user arrived via the reset-password email link).
   *
   * @param {() => void} callback - Called once the recovery session is ready
   */
  onPasswordRecovery(callback: () => void): void;

  /**
   * Initiates an OAuth sign-in flow by redirecting to the provider's auth page.
   * On success, the browser redirects back and Supabase establishes the session.
   *
   * @param {OAuthProvider} provider - OAuth provider to use
   */
  signInWithOAuth(provider: OAuthProvider): Promise<void>;
}

/** InjectionToken for AuthRepositoryContract. */
export const AUTH_REPOSITORY = new InjectionToken<AuthRepositoryContract>('AUTH_REPOSITORY');
