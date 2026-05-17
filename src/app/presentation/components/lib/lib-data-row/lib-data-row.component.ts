import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { LibIconComponent } from '@/components/lib/lib-icon/lib-icon.component';

/**
 * Fila de datos estilo `ls -la` de la lib Terminal Collector.
 * Muestra LABEL (mono uppercase, --text-lo) a la izquierda,
 * separador de puntos punteados y VALUE (mono, --text-hi) a la derecha.
 * Para valores complejos (estrellas, chips...) usar ng-content en lugar de value.
 */
@Component({
  selector: 'app-lib-data-row',
  standalone: true,
  imports: [LibIconComponent],
  templateUrl: './lib-data-row.component.html',
  styleUrl: './lib-data-row.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibDataRowComponent {
  /** Etiqueta del campo, en uppercase en pantalla. */
  readonly label: InputSignal<string> = input.required<string>();

  /** Valor del campo. Si es null, se muestra el ng-content. */
  readonly value: InputSignal<string | number | null> = input<string | number | null>(null);

  /** Nombre del icono de Material Icons junto al label. Opcional. */
  readonly icon: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** Si true, el valor se renderiza en tamaño y peso mayor (énfasis). */
  readonly emphasized: InputSignal<boolean> = input<boolean>(false);
}
