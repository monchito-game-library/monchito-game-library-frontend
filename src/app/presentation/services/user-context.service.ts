import { computed, inject, Injectable, Signal } from '@angular/core';
import { AuthService } from './auth.service';

/**
 * Servicio global para gestionar el usuario actualmente autenticado.
 * Ahora usa AuthService de Supabase en lugar de selección manual.
 * Mantiene compatibilidad con el código existente.
 */
@Injectable({ providedIn: 'root' })
export class UserContextService {
  private readonly authService = inject(AuthService);

  /**
   * Señal computada que devuelve el ID del usuario autenticado
   * Mantiene compatibilidad con el código existente
   */
  readonly userId: Signal<string | null> = computed((): string | null => {
    return this.authService.getUserId();
  });

  /**
   * @deprecated Ya no es necesario con autenticación real
   * Mantenido para compatibilidad
   */
  setUser(id: string): void {
    console.warn('setUser() is deprecated with Supabase Auth');
  }

  /**
   * Cierra la sesión del usuario
   * Ahora usa AuthService
   */
  clearUser(): void {
    void this.authService.signOut();
  }

  /**
   * Indica si hay un usuario actualmente autenticado
   */
  isUserSelected(): boolean {
    return this.authService.isAuthenticated();
  }

  /**
   * Obtiene el email del usuario autenticado
   */
  getUserEmail(): string | null {
    return this.authService.getUserEmail();
  }

  /**
   * Obtiene el nombre para mostrar del usuario
   */
  getDisplayName(): string {
    return this.authService.getDisplayName();
  }

  /**
   * Obtiene la URL del avatar del usuario
   */
  getAvatarUrl(): string {
    return this.authService.getAvatarUrl();
  }
}
