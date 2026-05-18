import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { RetroBadgeVariant } from './retro-badge.types';

/**
 * Badge de contador o indicador de estado de la lib Terminal Collector.
 * Con dot=true muestra solo un punto de color (sin label), útil como indicador de estado.
 */
@Component({
  selector: 'retro-badge',
  standalone: true,
  imports: [],
  templateUrl: './retro-badge.component.html',
  styleUrl: './retro-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroBadgeComponent {
  /** Texto o número mostrado en el badge. */
  readonly label: InputSignal<string | number> = input.required<string | number>();

  /** Variante visual / semántica del badge. */
  readonly variant: InputSignal<RetroBadgeVariant> = input<RetroBadgeVariant>('neutral');

  /** Si true, muestra solo un punto de color sin label (indicador de estado). */
  readonly dot: InputSignal<boolean> = input<boolean>(false);
}
