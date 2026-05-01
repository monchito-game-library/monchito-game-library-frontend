import { inject, Injectable } from '@angular/core';
import { Session, SupabaseClient, User } from '@supabase/supabase-js';

import { SUPABASE_CLIENT } from '@/data/config/supabase.config';
import { AuthUserModel } from '@/models/auth/auth-user.model';
import { AuthRepositoryContract } from '@/domain/repositories/auth.repository.contract';
import { OAuthProvider } from '@/types/oauth-provider.type';

@Injectable({ providedIn: 'root' })
export class SupabaseAuthRepository implements AuthRepositoryContract {
  private readonly _supabase: SupabaseClient = inject(SUPABASE_CLIENT);

  /** True once Supabase has fired PASSWORD_RECOVERY, even before any component subscribes. */
  private _passwordRecoveryDetected = false;

  constructor() {
    // Register early so PASSWORD_RECOVERY is never missed due to late component subscription.
    this._supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        this._passwordRecoveryDetected = true;
      }
    });
  }

  /**
   * Returns the authenticated user from the active session, or null if there is none.
   */
  async getSession(): Promise<AuthUserModel | null> {
    const {
      data: { session }
    } = await this._supabase.auth.getSession();
    return session?.user ? this._mapUser(session.user) : null;
  }

  /**
   * Signs in with email and password. Throws if the credentials are invalid.
   *
   * @param {string} email - Dirección de email del usuario
   * @param {string} password - Contraseña en texto plano
   */
  async signIn(email: string, password: string): Promise<AuthUserModel> {
    const { data, error } = await this._supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error(error?.message ?? 'Login failed');
    return this._mapUser(data.user);
  }

  /**
   * Creates a new user account. Si se proporciona `returnUrl`, se construye un
   * `emailRedirectTo` absoluto que lleva al usuario a esa ruta tras confirmar el email.
   * La fila en `user_preferences` la crea el trigger `handle_new_user` (SECURITY DEFINER)
   * en cuanto Supabase Auth inserta la fila en `auth.users`, así que no hace falta upsert manual.
   *
   * @param {string} email - Dirección de email del usuario
   * @param {string} password - Contraseña en texto plano
   * @param {string} [displayName] - Falls back to the email local part if not provided.
   * @param {string | null} [returnUrl] - Ruta absoluta (ej. `/orders/invite/abc`) a la que redirigir
   *   tras la confirmación del email
   */
  async signUp(
    email: string,
    password: string,
    displayName?: string,
    returnUrl?: string | null
  ): Promise<AuthUserModel> {
    const emailRedirectTo: string = returnUrl ? `${window.location.origin}${returnUrl}` : window.location.origin;
    const { data, error } = await this._supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName ?? email.split('@')[0] },
        emailRedirectTo
      }
    });
    if (error || !data.user) throw new Error(error?.message ?? 'Registration failed');
    return this._mapUser(data.user);
  }

  /**
   * Signs out the current user.
   */
  async signOut(): Promise<void> {
    const { error } = await this._supabase.auth.signOut();
    if (error) throw new Error(error.message);
  }

  /**
   * Sends a password-reset email with a redirect URL.
   *
   * @param {string} email - Dirección de email del usuario
   */
  async resetPassword(email: string): Promise<void> {
    const { error } = await this._supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`
    });
    if (error) throw new Error(error.message);
  }

  /**
   * Registers a listener that fires on every auth state change.
   * The callback receives null when the user signs out or the session expires.
   *
   * @param {(user: AuthUserModel | null) => void} callback
   */
  onAuthStateChange(callback: (user: AuthUserModel | null) => void): void {
    this._supabase.auth.onAuthStateChange((_event, session: Session | null) => {
      callback(session?.user ? this._mapUser(session.user) : null);
    });
  }

  /**
   * Updates the display name in the user's Supabase auth metadata.
   * Triggers onAuthStateChange with USER_UPDATED, updating the reactive state automatically.
   *
   * @param {string} displayName - New display name
   */
  async updateDisplayName(displayName: string): Promise<void> {
    const { error } = await this._supabase.auth.updateUser({
      data: { display_name: displayName }
    });
    if (error) throw new Error(`Failed to update display name: ${error.message}`);
  }

  /**
   * Updates the authenticated user's password.
   * Must be called while a PASSWORD_RECOVERY session is active.
   *
   * @param {string} newPassword - New password in plain text
   */
  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this._supabase.auth.updateUser({ password: newPassword });
    if (error) throw new Error(error.message);
  }

  /**
   * Registers a listener that fires once when Supabase detects a PASSWORD_RECOVERY session.
   * If the event already fired before the component subscribed, calls the callback immediately.
   *
   * @param {() => void} callback - Called when the recovery session is established
   */
  onPasswordRecovery(callback: () => void): void {
    if (this._passwordRecoveryDetected) {
      callback();
      return;
    }
    this._supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        this._passwordRecoveryDetected = true;
        callback();
      }
    });
  }

  /**
   * Initiates an OAuth sign-in flow by redirecting to the provider's auth page.
   * Si se proporciona `returnUrl`, se usa para construir el `redirectTo` absoluto del callback,
   * de modo que el navegador aterrice directamente en el destino (ej. `/orders/invite/abc`)
   * tras la autenticación, sin depender de almacenamiento intermedio.
   *
   * @param {OAuthProvider} provider - OAuth provider to use
   * @param {string | null} [returnUrl] - Ruta absoluta a la que redirigir tras el callback
   */
  async signInWithOAuth(provider: OAuthProvider, returnUrl?: string | null): Promise<void> {
    const redirectTo: string = returnUrl ? `${window.location.origin}${returnUrl}` : window.location.origin;
    const { error } = await this._supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo }
    });
    if (error) throw new Error(error.message);
  }

  /**
   * Maps a Supabase User object to the domain AuthUserModel.
   *
   * @param {User} user - Objeto usuario de Supabase Auth
   */
  private _mapUser(user: User): AuthUserModel {
    return {
      id: user.id,
      email: user.email ?? null,
      displayName:
        user.user_metadata?.['display_name'] ?? user.user_metadata?.['full_name'] ?? user.email?.split('@')[0] ?? null,
      avatarUrl: user.user_metadata?.['avatar_url'] ?? null
    };
  }
}
