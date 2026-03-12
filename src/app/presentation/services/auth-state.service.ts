import { inject, Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { Router } from '@angular/router';

import { AUTH_USE_CASES, AuthUseCasesContract } from '@/domain/use-cases/auth/auth.use-cases.contract';
import { AuthUserModel } from '@/models/auth/auth-user.model';

/**
 * Presentation service that holds reactive auth session state.
 * Does not contain business logic — only shares the authenticated user across components.
 */
@Injectable({ providedIn: 'root' })
export class AuthStateService {
  private readonly _authUseCases: AuthUseCasesContract = inject(AUTH_USE_CASES);
  private readonly _router: Router = inject(Router);

  private readonly _currentUser: WritableSignal<AuthUserModel | null> = signal(null);
  private readonly _loading: WritableSignal<boolean> = signal(true);

  /** Usuario actualmente autenticado */
  readonly currentUser: Signal<AuthUserModel | null> = this._currentUser.asReadonly();

  /** Indica si se está resolviendo la sesión inicial */
  readonly loading: Signal<boolean> = this._loading.asReadonly();

  constructor() {
    void this._initSession();
  }

  /**
   * Resuelve la sesión activa al arrancar y registra el listener de cambios de auth.
   */
  private async _initSession(): Promise<void> {
    const user: AuthUserModel | null = await this._authUseCases.getSession();
    this._currentUser.set(user);
    this._loading.set(false);

    this._authUseCases.onAuthStateChange((updatedUser: AuthUserModel | null) => {
      const wasAuthenticated: boolean = this._currentUser() !== null;
      this._currentUser.set(updatedUser);

      if (wasAuthenticated && updatedUser === null) {
        void this._router.navigate(['/login']);
      }
    });
  }

  /**
   * Indica si hay un usuario autenticado.
   */
  isAuthenticated(): boolean {
    return this._currentUser() !== null;
  }

  /**
   * Devuelve el ID del usuario autenticado, o null si no hay sesión.
   */
  getUserId(): string | null {
    return this._currentUser()?.id ?? null;
  }

  /**
   * Devuelve el email del usuario autenticado.
   */
  getUserEmail(): string | null {
    return this._currentUser()?.email ?? null;
  }

  /**
   * Devuelve el nombre para mostrar del usuario autenticado.
   */
  getDisplayName(): string {
    return this._currentUser()?.displayName ?? '';
  }

  /**
   * Devuelve la URL del avatar del usuario en Supabase, o null si no tiene.
   */
  getAvatarUrl(): string | null {
    return this._currentUser()?.avatarUrl ?? null;
  }
}
