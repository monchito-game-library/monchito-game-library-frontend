import { computed, inject, Injectable, Signal } from '@angular/core';

import { AuthStateService } from './auth-state.service';
import { AUTH_USE_CASES, AuthUseCasesContract } from '@/domain/use-cases/auth/auth.use-cases.contract';

/**
 * Facade global para acceder al usuario autenticado y ejecutar acciones de sesión.
 * Delega el estado a AuthStateService y las operaciones a AuthUseCasesContract.
 */
@Injectable({ providedIn: 'root' })
export class UserContextService {
  private readonly _authState: AuthStateService = inject(AuthStateService);
  private readonly _authUseCases: AuthUseCasesContract = inject(AUTH_USE_CASES);

  /** Señal computada con el ID del usuario autenticado */
  readonly userId: Signal<string | null> = computed((): string | null => this._authState.getUserId());

  /**
   * Indica si hay un usuario actualmente autenticado.
   */
  isUserSelected(): boolean {
    return this._authState.isAuthenticated();
  }

  /**
   * Cierra la sesión del usuario actual.
   */
  clearUser(): void {
    void this._authUseCases.signOut();
  }

  /**
   * Devuelve el email del usuario autenticado.
   */
  getUserEmail(): string | null {
    return this._authState.getUserEmail();
  }

  /**
   * Devuelve el nombre para mostrar del usuario autenticado.
   */
  getDisplayName(): string {
    return this._authState.getDisplayName();
  }

  /**
   * Devuelve la URL del avatar del usuario.
   * Genera un avatar automático si el usuario no tiene uno personalizado.
   */
  getAvatarUrl(): string {
    const url: string | null = this._authState.getAvatarUrl();
    if (url) return url;

    const name: string = this._authState.getDisplayName();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff&size=128`;
  }
}
