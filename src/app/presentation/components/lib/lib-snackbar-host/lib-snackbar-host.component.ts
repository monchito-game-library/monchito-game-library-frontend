import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoPipe } from '@jsverse/transloco';

import { LibIconButtonComponent } from '@/components/lib/lib-icon-button/lib-icon-button.component';
import { LibSnackbarMessage, LibSnackbarService } from '@/services/lib-snackbar/lib-snackbar.service';

/**
 * Host global de snackbars Terminal Collector.
 * Se monta una única vez en `app.component.html`.
 * Renderiza la cola de mensajes del LibSnackbarService.
 */
@Component({
  selector: 'app-lib-snackbar-host',
  standalone: true,
  imports: [LibIconButtonComponent, TranslocoPipe],
  templateUrl: './lib-snackbar-host.component.html',
  styleUrl: './lib-snackbar-host.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibSnackbarHostComponent {
  /** Servicio de snackbar — expuesto al template. */
  readonly service: LibSnackbarService = inject(LibSnackbarService);

  /**
   * Ejecuta el handler de la acción del mensaje y lo descarta.
   *
   * @param {LibSnackbarMessage} msg - Mensaje cuya acción se ejecuta
   */
  onAction(msg: LibSnackbarMessage): void {
    msg.action?.handler();
    this.service.dismiss(msg.id);
  }

  /**
   * Descarta el mensaje con el id dado.
   *
   * @param {number} id - Id del mensaje a descartar
   */
  dismiss(id: number): void {
    this.service.dismiss(id);
  }
}
