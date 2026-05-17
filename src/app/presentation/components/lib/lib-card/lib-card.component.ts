import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { LibCardVariant } from '@/types/lib-component.type';

/**
 * Contenedor neutro de la lib Terminal Collector.
 * Rectángulo borde 1px, fondo --bg-surface, sin sombras, sin border-radius.
 * Cuando interactive=true expone role=button y emite cardClicked.
 */
@Component({
  selector: 'app-lib-card',
  standalone: true,
  imports: [],
  templateUrl: './lib-card.component.html',
  styleUrl: './lib-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibCardComponent {
  /** Activa comportamiento de tarjeta clicable (role=button, hover, focus). */
  readonly interactive: InputSignal<boolean> = input<boolean>(false);

  /** Añade padding interno (1rem) y gap entre hijos (0.75rem). */
  readonly padded: InputSignal<boolean> = input<boolean>(true);

  /** Variante visual de la tarjeta. */
  readonly variant: InputSignal<LibCardVariant> = input<LibCardVariant>('default');

  /** Emite el MouseEvent cuando la tarjeta es interactiva y se hace clic. */
  readonly cardClicked: OutputEmitterRef<MouseEvent> = output<MouseEvent>();
}
