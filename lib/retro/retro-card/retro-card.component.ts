import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  OutputEmitterRef,
  Signal,
  computed,
  input,
  output
} from '@angular/core';
import { LibCardVariant, RetroCardPadding } from './retro-card.types';

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

  /** Variante visual de la tarjeta. */
  readonly variant: InputSignal<LibCardVariant> = input<LibCardVariant>('default');

  /** Tamaño de padding interno: none=0, sm=0.75rem, md=1rem (default), lg=1.5rem/1rem. */
  readonly padding: InputSignal<RetroCardPadding> = input<RetroCardPadding>('md');

  /**
   * @deprecated Usar `padding` en su lugar. `true` → `md`, `false` → `none`.
   */
  readonly padded: InputSignal<boolean | undefined> = input<boolean | undefined>(undefined);

  /** Aplica estado visual de tarjeta seleccionada (borde 2px + fondo `--bg-surface-hi`). */
  readonly selected: InputSignal<boolean> = input<boolean>(false);

  /** @internal */
  readonly resolvedPadding: Signal<RetroCardPadding> = computed<RetroCardPadding>(() => {
    const p = this.padded();
    if (p === false) return 'none';
    if (p === true) return 'md';
    return this.padding();
  });

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
