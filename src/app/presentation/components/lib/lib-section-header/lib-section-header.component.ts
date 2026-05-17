import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';

/**
 * Cabecera de sección estilo terminal de la lib Terminal Collector.
 * Muestra `> SECTION_NAME [count]` con borde inferior 1px --border.
 * Acepta slot `[slot=actions]` para botones a la derecha.
 */
@Component({
  selector: 'app-lib-section-header',
  standalone: true,
  imports: [],
  templateUrl: './lib-section-header.component.html',
  styleUrl: './lib-section-header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibSectionHeaderComponent {
  /** Texto de la sección, en uppercase en pantalla. */
  readonly label: InputSignal<string> = input.required<string>();

  /** Contador opcional mostrado entre corchetes `[N]`. */
  readonly count: InputSignal<number | string | null> = input<number | string | null>(null);
}
