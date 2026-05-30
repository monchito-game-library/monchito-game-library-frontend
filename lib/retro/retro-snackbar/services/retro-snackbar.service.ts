import { Injectable, Signal, signal, WritableSignal } from '@angular/core';

import { LibSnackbarVariant, RetroSnackbarMessage } from '../interfaces/retro-snackbar-message.interface';

export type { RetroSnackbarMessage };

/**
 * Servicio singleton que gestiona una cola de mensajes tipo snackbar.
 * Los mensajes se auto-descartan tras `duration` ms (por defecto 4000).
 * Se monta en `app.component.html` via `<retro-snackbar-host>`.
 */
@Injectable({ providedIn: 'root' })
export class RetroSnackbarService {
  private readonly _timers: Map<number, ReturnType<typeof setTimeout>> = new Map<
    number,
    ReturnType<typeof setTimeout>
  >();
  private readonly _messages: WritableSignal<readonly RetroSnackbarMessage[]> = signal<readonly RetroSnackbarMessage[]>(
    []
  );
  private static readonly _MAX_ID = Number.MAX_SAFE_INTEGER - 1;
  private _nextId = 0;

  /** Lista reactiva de mensajes activos (para el host). */
  readonly messages: Signal<readonly RetroSnackbarMessage[]> = this._messages.asReadonly();

  /**
   * Encola un mensaje. Auto-dismiss tras duration ms (default 4000).
   * Retorna el id del mensaje para cierre programático.
   *
   * @param {Omit<RetroSnackbarMessage, 'id' | 'duration' | 'variant'> & Partial<Pick<RetroSnackbarMessage, 'duration' | 'variant'>>} msg
   * @returns {number} id del mensaje encolado
   */
  open(
    msg: Omit<RetroSnackbarMessage, 'id' | 'duration' | 'variant'> &
      Partial<Pick<RetroSnackbarMessage, 'duration' | 'variant'>>
  ): number {
    if (this._nextId >= RetroSnackbarService._MAX_ID) {
      this._nextId = 0;
    }
    const id = this._nextId++;
    const duration = msg.duration ?? 4000;
    const variant: LibSnackbarVariant = msg.variant ?? 'info';
    const message: RetroSnackbarMessage = { ...msg, id, duration, variant };

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
