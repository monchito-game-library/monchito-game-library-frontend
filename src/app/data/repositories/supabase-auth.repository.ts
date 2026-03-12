import { Injectable } from '@angular/core';
import { Session, SupabaseClient, User } from '@supabase/supabase-js';

import { getSupabaseClient } from '@/data/config/supabase.config';
import { AuthUserModel } from '@/models/auth/auth-user.model';
import { AuthRepositoryContract } from '@/domain/repositories/auth.repository.contract';

@Injectable({ providedIn: 'root' })
export class SupabaseAuthRepository implements AuthRepositoryContract {
  private readonly _supabase: SupabaseClient = getSupabaseClient();

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
   * @param {string} email
   * @param {string} password
   */
  async signIn(email: string, password: string): Promise<AuthUserModel> {
    const { data, error } = await this._supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error(error?.message ?? 'Login failed');
    return this._mapUser(data.user);
  }

  /**
   * Creates a new user account.
   *
   * @param {string} email
   * @param {string} password
   * @param {string} [displayName] - Falls back to the email local part if not provided.
   */
  async signUp(email: string, password: string, displayName?: string): Promise<AuthUserModel> {
    const { data, error } = await this._supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName ?? email.split('@')[0] }
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
   * @param {string} email
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
   * Maps a Supabase User object to the domain AuthUserModel.
   *
   * @param {User} user
   */
  private _mapUser(user: User): AuthUserModel {
    return {
      id: user.id,
      email: user.email ?? null,
      displayName: user.user_metadata?.['display_name'] ?? user.email?.split('@')[0] ?? null,
      avatarUrl: user.user_metadata?.['avatar_url'] ?? null
    };
  }
}
