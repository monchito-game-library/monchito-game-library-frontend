import { InjectionToken } from '@angular/core';
import { AuthUserModel } from '@/models/auth/auth-user.model';
import { OAuthProvider } from '@/types/oauth-provider.type';

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

  /**
   * Updates the authenticated user's password.
   * Must be called while a PASSWORD_RECOVERY session is active.
   *
   * @param {string} newPassword - New password in plain text
   */
  updatePassword(newPassword: string): Promise<AuthResult>;

  /**
   * Registers a listener that fires when Supabase detects a PASSWORD_RECOVERY session.
   *
   * @param {() => void} callback - Called once the recovery session is ready
   */
  onPasswordRecovery(callback: () => void): void;

  /**
   * Initiates an OAuth sign-in flow. Redirects the browser to the provider's auth page.
   * Returns { success: false, error } if the redirect cannot be initiated.
   *
   * @param {OAuthProvider} provider - OAuth provider to use
   */
  signInWithOAuth(provider: OAuthProvider): Promise<AuthResult>;
}

export const AUTH_USE_CASES = new InjectionToken<AuthUseCasesContract>('AUTH_USE_CASES');
