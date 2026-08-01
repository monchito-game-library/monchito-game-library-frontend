import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  Signal,
  computed,
  input
} from '@angular/core';
import { LibIconSize } from '../retro-icon/retro-icon.types';
import { RetroBadgeVariant, RetroBadgeSize } from './retro-badge.types';

/**
 * Badge numérico reutilizable de la lib Terminal Collector.
 * Diseñado para mostrar un valor numérico (1-5) que representa un nivel
 * de prioridad o cantidad. Borde 1px del color del variant, número grande
 * en fuente monoespaciada, border-radius: 0.
 *
 * Si el variant no se especifica, se auto-mapea desde el value usando la
 * convención más común (P1 = máxima prioridad → danger/rose).
 *
 * Tamaños: sm (compacto), md (default), lg (destacado).
 */
@Component({
  selector: 'retro-badge',
  standalone: true,
  templateUrl: './retro-badge.component.html',
  styleUrl: './retro-badge.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroBadgeComponent {
  /** Valor numérico a mostrar (1-5). */
  readonly value: InputSignal<number> = input.required<number>();

  /** Variant de color. Si se omite, se auto-mapea desde value. */
  readonly variant: InputSignal<RetroBadgeVariant | undefined> = input<RetroBadgeVariant | undefined>(undefined);

  /** Tamaño del badge. */
  readonly size: InputSignal<RetroBadgeSize> = input<RetroBadgeSize>('md');

  /** Etiqueta opcional para tooltip. Si no se da, usa el displayLabel. */
  readonly tooltip: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** Si true, muestra solo el número sin prefijo "P". */
  readonly bare: InputSignal<boolean> = input<boolean>(false);

  /**
   * Variant resuelto. Si el usuario no especifica uno, se mapea desde value:
   * - 1 → 'rose' (alta urgencia)
   * - 2,3 → 'amber' (media)
   * - 4,5 → 'green' (baja)
   */
  readonly effectiveVariant: Signal<RetroBadgeVariant> = computed<RetroBadgeVariant>(() => {
    const explicit = this.variant();
    if (explicit) return explicit;
    const v = this.value();
    if (v <= 1) return 'rose';
    if (v <= 3) return 'amber';
    return 'green';
  });

  /** Etiqueta a mostrar dentro del badge. */
  readonly displayLabel: Signal<string> = computed<string>(() => {
    const v = this.value();
    return this.bare() ? String(v) : `P${v}`;
  });

  /** Tamaño del icono (reservado para uso futuro con icono). */
  readonly iconSize: Signal<LibIconSize> = computed<LibIconSize>(() => {
    if (this.size() === 'sm') return 'xs';
    return 'sm';
  });
}
