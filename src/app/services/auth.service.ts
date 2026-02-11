import { Injectable, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';
import { AuthChangeEvent, AuthSession, Session, User } from '@supabase/supabase-js';
import { getSupabaseClient } from '../config/supabase.config';

/**
 * Interfaz para los datos de registro
 */
export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
}

/**
 * Interfaz para los datos de login
 */
export interface SignInData {
  email: string;
  password: string;
}

/**
 * Servicio de autenticación usando Supabase Auth
 * Maneja registro, login, logout y estado de sesión
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly supabase = getSupabaseClient();
  private readonly _currentUser: WritableSignal<User | null> = signal(null);
  private readonly _loading: WritableSignal<boolean> = signal(true);

  /** Usuario actualmente autenticado */
  readonly currentUser = this._currentUser.asReadonly();

  /** Indica si se está cargando la sesión */
  readonly loading = this._loading.asReadonly();

  constructor(private readonly router: Router) {
    this.initializeAuth();
  }

  /**
   * Inicializa la autenticación y escucha cambios de sesión
   */
  private async initializeAuth(): Promise<void> {
    // Obtener sesión actual
    const {
      data: { session }
    } = await this.supabase.auth.getSession();
    this._currentUser.set(session?.user ?? null);
    this._loading.set(false);

    // Escuchar cambios de autenticación
    this.supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      this._currentUser.set(session?.user ?? null);
      this.handleAuthChange(event, session);
    });
  }

  /**
   * Maneja los cambios de estado de autenticación
   */
  private handleAuthChange(event: AuthChangeEvent, session: Session | null): void {
    switch (event) {
      case 'SIGNED_IN':
        console.log('User signed in:', session?.user?.email);
        break;
      case 'SIGNED_OUT':
        console.log('User signed out');
        void this.router.navigate(['/login']);
        break;
      case 'TOKEN_REFRESHED':
        console.log('Token refreshed');
        break;
      case 'USER_UPDATED':
        console.log('User updated');
        break;
    }
  }

  /**
   * Registra un nuevo usuario
   * @param data Datos de registro (email, password, displayName)
   * @returns Promise con el resultado del registro
   */
  async signUp(data: SignUpData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: authData, error } = await this.supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            display_name: data.displayName || data.email.split('@')[0]
          }
        }
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Registration failed' };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  }

  /**
   * Inicia sesión con email y password
   * @param data Credenciales de login
   * @returns Promise con el resultado del login
   */
  async signIn(data: SignInData): Promise<{ success: boolean; error?: string }> {
    try {
      const { data: authData, error } = await this.supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (!authData.user) {
        return { success: false, error: 'Login failed' };
      }

      // Navegar al home después del login exitoso
      await this.router.navigate(['/home']);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  }

  /**
   * Cierra la sesión del usuario actual
   */
  async signOut(): Promise<void> {
    await this.supabase.auth.signOut();
    this._currentUser.set(null);
    await this.router.navigate(['/login']);
  }

  /**
   * Envía un email para recuperar la contraseña
   * @param email Email del usuario
   * @returns Promise con el resultado
   */
  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  }

  /**
   * Actualiza la contraseña del usuario
   * @param newPassword Nueva contraseña
   * @returns Promise con el resultado
   */
  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await this.supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'An unexpected error occurred' };
    }
  }

  /**
   * Verifica si hay un usuario autenticado
   */
  isAuthenticated(): boolean {
    return !!this._currentUser();
  }

  /**
   * Obtiene el ID del usuario actual
   */
  getUserId(): string | null {
    return this._currentUser()?.id ?? null;
  }

  /**
   * Obtiene el email del usuario actual
   */
  getUserEmail(): string | null {
    return this._currentUser()?.email ?? null;
  }

  /**
   * Obtiene el nombre para mostrar del usuario
   */
  getDisplayName(): string {
    const user = this._currentUser();
    if (!user) return '';

    return user.user_metadata?.['display_name'] || user.email?.split('@')[0] || 'User';
  }

  /**
   * Obtiene la URL del avatar del usuario
   */
  getAvatarUrl(): string {
    const user = this._currentUser();
    if (!user) return '';

    // Si el usuario tiene una foto personalizada, usarla
    if (user.user_metadata?.['avatar_url']) {
      return user.user_metadata['avatar_url'];
    }

    // Generar avatar automático basado en el nombre
    const name = this.getDisplayName();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  }
}
