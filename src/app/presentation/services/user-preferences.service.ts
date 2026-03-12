import { Injectable, signal, WritableSignal } from '@angular/core';

/**
 * Servicio de presentación que mantiene el estado reactivo de las preferencias de usuario.
 * No contiene lógica de negocio — solo comparte estado entre componentes.
 */
@Injectable({ providedIn: 'root' })
export class UserPreferencesService {
  /** URL del avatar del usuario actual */
  readonly avatarUrl: WritableSignal<string | null> = signal(null);

  /** Indica si se está subiendo un avatar */
  readonly uploadingAvatar: WritableSignal<boolean> = signal(false);
}
