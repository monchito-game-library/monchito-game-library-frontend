import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { LibIconSize } from './retro-icon.types';

/**
 * Icono reutilizable de la lib Terminal Collector.
 * Renderiza un <span class="material-icons"> usando la webfont Material Icons
 * ya cargada en index.html.
 *
 * A11y:
 * - aria-hidden="true" por defecto (decorativo).
 * - Para iconos informativos, el call-site añade aria-label al contenedor padre.
 *
 * Deuda a11y: ninguna.
 */
@Component({
  selector: 'retro-icon',
  standalone: true,
  templateUrl: './retro-icon.component.html',
  styleUrl: './retro-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'retro-icon-host',
    '[class.retro-icon-host--xs]': "size() === 'xs'",
    '[class.retro-icon-host--sm]': "size() === 'sm'",
    '[class.retro-icon-host--md]': "size() === 'md'",
    '[class.retro-icon-host--lg]': "size() === 'lg'",
    '[class.retro-icon-host--xl]': "size() === 'xl'",
    '[class.retro-icon-host--2xl]': "size() === '2xl'",
  }
})
export class RetroIconComponent {
  /** Nombre del icono Material Icons (liga de la webfont). */
  readonly name: InputSignal<string> = input.required<string>();

  /** Tamaño del icono. */
  readonly size: InputSignal<LibIconSize> = input<LibIconSize>('md');

  /** Oculta el icono a los lectores de pantalla cuando es decorativo. */
  readonly ariaHidden: InputSignal<boolean> = input<boolean>(true);
}
