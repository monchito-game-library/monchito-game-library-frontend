import { computed, Injectable, signal } from '@angular/core';

/**
 * Servicio global para gestionar el usuario actualmente seleccionado.
 * Utiliza señales reactivas para exponer y modificar el contexto del usuario.
 */
@Injectable({ providedIn: 'root' })
export class UserContextService {
  /** Señal interna que almacena el ID del usuario (o null si no se ha seleccionado) */
  private readonly _userId = signal<string | null>(null);

  /** Señal computada expuesta públicamente con el valor del usuario actual */
  readonly userId = computed(() => this._userId());

  /**
   * Establece el ID del usuario activo en la aplicación
   * @param id ID del usuario (ej.: 'alberto')
   */
  setUser(id: string): void {
    this._userId.set(id);
  }

  /** Elimina el usuario actual (útil para logout o cambio de perfil) */
  clearUser(): void {
    this._userId.set(null);
  }

  /** Indica si hay un usuario actualmente seleccionado */
  isUserSelected(): boolean {
    return !!this._userId();
  }
}
