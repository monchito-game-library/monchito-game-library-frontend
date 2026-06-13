import { ChangeDetectionStrategy, Component, Signal, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { RetroIconButtonComponent } from '../../../retro-icon-button/retro-icon-button.component';
import { RetroSnackbarMessage, RetroSnackbarService } from '../../services/retro-snackbar.service';

/**
 * Host global de snackbars Terminal Collector.
 * Se monta una única vez en `app.component.html`.
 * Renderiza la cola de mensajes del RetroSnackbarService.
 */
@Component({
  selector: 'retro-snackbar-host',
  standalone: true,
  imports: [RetroIconButtonComponent, TranslocoPipe],
  templateUrl: './retro-snackbar-host.component.html',
  styleUrl: './retro-snackbar-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroSnackbarHostComponent {
  /** @private Servicio de snackbar — uso interno. */
  private readonly _service: RetroSnackbarService = inject(RetroSnackbarService);

  /** Lista reactiva de mensajes activos expuesta al template. */
  readonly messages: Signal<readonly RetroSnackbarMessage[]> = this._service.messages;

  /**
   * Ejecuta el handler de la acción del mensaje y lo descarta.
   *
   * @param {RetroSnackbarMessage} msg - Mensaje cuya acción se ejecuta
   */
  onAction(msg: RetroSnackbarMessage): void {
    msg.action?.handler();
    this._service.dismiss(msg.id);
  }

  /**
   * Descarta el mensaje con el id dado.
   *
   * @param {number} id - Id del mensaje a descartar
   */
  dismiss(id: number): void {
    this._service.dismiss(id);
  }
}
