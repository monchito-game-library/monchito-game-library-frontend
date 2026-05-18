import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { LibCardVariant } from './retro-card.types';

/**
 * Contenedor neutro de la lib Terminal Collector.
 * Rectángulo borde 1px, fondo --bg-surface, sin sombras, sin border-radius.
 * Cuando interactive=true expone role=button y emite cardClicked.
 */
@Component({
  selector: 'retro-card',
  standalone: true,
  imports: [],
  templateUrl: './retro-card.component.html',
  styleUrl: './retro-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroCardComponent {
  /** Activa comportamiento de tarjeta clicable (role=button, hover, focus). */
  readonly interactive: InputSignal<boolean> = input<boolean>(false);

  /** Añade padding interno (1rem) y gap entre hijos (0.75rem). */
  readonly padded: InputSignal<boolean> = input<boolean>(true);

  /** Variante visual de la tarjeta. */
  readonly variant: InputSignal<LibCardVariant> = input<LibCardVariant>('default');

  /** Emite el MouseEvent cuando la tarjeta es interactiva y se hace clic. */
  readonly cardClicked: OutputEmitterRef<MouseEvent> = output<MouseEvent>();

  /**
   * Gestiona el evento keydown.space condicionando tanto la emisión del click
   * como el preventDefault al input interactive().
   * Issue E fix: evita que preventDefault se ejecute en tarjetas no interactivas.
   *
   * @param {Event} event - Evento de teclado de la barra espaciadora
   */
  onKeydown(event: Event): void {
    if (!this.interactive()) return;
    event.preventDefault();
    this.cardClicked.emit(event as unknown as MouseEvent);
  }
}
