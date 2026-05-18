import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';

/**
 * Estado vacío estilo terminal ASCII de la lib Terminal Collector.
 * Muestra un bloque ASCII + título + subtítulo + hint mono.
 * Acepta ng-content para botones de acción.
 */
@Component({
  selector: 'retro-empty-state',
  standalone: true,
  imports: [],
  templateUrl: './retro-empty-state.component.html',
  styleUrl: './retro-empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroEmptyStateComponent {
  /** Título principal del estado vacío, en uppercase en pantalla. */
  readonly title: InputSignal<string> = input.required<string>();

  /** Subtítulo o descripción adicional. */
  readonly subtitle: InputSignal<string> = input<string>('');

  /** Hint en estilo prompt de terminal. */
  readonly hint: InputSignal<string> = input<string>('$ try a different query');
}
