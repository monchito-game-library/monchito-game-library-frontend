import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { LibSnackbarVariant } from '@/types/lib-component.type';
import { LibSnackbarMessage } from '@/interfaces/lib-snackbar-message.interface';

export type { LibSnackbarMessage };

/**
 * Servicio singleton que gestiona una cola de mensajes tipo snackbar.
 * Los mensajes se auto-descartan tras `duration` ms (por defecto 4000).
 * Se monta en `app.component.html` via `<app-lib-snackbar-host>`.
 */
@Injectable({ providedIn: 'root' })
export class LibSnackbarService {
  private _nextId = 0;
  private readonly _timers: Map<number, ReturnType<typeof setTimeout>> = new Map<
    number,
    ReturnType<typeof setTimeout>
  >();
  private readonly _messages: WritableSignal<readonly LibSnackbarMessage[]> = signal<readonly LibSnackbarMessage[]>([]);

  /** Lista reactiva de mensajes activos (para el host). */
  readonly messages: Signal<readonly LibSnackbarMessage[]> = this._messages.asReadonly();

  /**
   * Encola un mensaje. Auto-dismiss tras duration ms (default 4000).
   * Retorna el id del mensaje para cierre programático.
   *
   * @param {Omit<LibSnackbarMessage, 'id' | 'duration' | 'variant'> & Partial<Pick<LibSnackbarMessage, 'duration' | 'variant'>>} msg
   * @returns {number} id del mensaje encolado
   */
  open(
    msg: Omit<LibSnackbarMessage, 'id' | 'duration' | 'variant'> &
      Partial<Pick<LibSnackbarMessage, 'duration' | 'variant'>>
  ): number {
    const id = this._nextId++;
    const duration = msg.duration ?? 4000;
    const variant: LibSnackbarVariant = msg.variant ?? 'info';
    const message: LibSnackbarMessage = { ...msg, id, duration, variant };

    this._messages.update((msgs) => [...msgs, message]);

    if (duration > 0) {
      const timer = setTimeout(() => this.dismiss(id), duration);
      this._timers.set(id, timer);
    }

    return id;
  }

  /**
   * Cierra programáticamente el mensaje con el id dado.
   *
   * @param {number} id - Id del mensaje a descartar
   */
  dismiss(id: number): void {
    const timer = this._timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this._timers.delete(id);
    }
    this._messages.update((msgs) => msgs.filter((m) => m.id !== id));
  }

  /**
   * Descarta todos los mensajes activos.
   */
  dismissAll(): void {
    this._timers.forEach((timer) => clearTimeout(timer));
    this._timers.clear();
    this._messages.set([]);
  }
}
