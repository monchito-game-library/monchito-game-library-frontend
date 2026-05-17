import { ChangeDetectionStrategy, Component, input, InputSignal } from '@angular/core';
import { NgStyle } from '@angular/common';
import { LibSkeletonShape } from '@/types/lib-component.type';

/**
 * Skeleton de carga reutilizable de la lib Terminal Collector.
 * Geometría: rectángulo plano sin border-radius (la prop `shape="square"` o `shape="line"`
 * son meros alias semánticos; ambos producen un rectángulo terminal).
 * Animación: shimmer horizontal entre `--bg-surface` (25%) → `--bg-surface-hi` (50%)
 *   → `--bg-surface` (75%), 1.4s lineal infinita.
 * En `prefers-reduced-motion: reduce` la animación se detiene en un fondo plano
 * `--bg-surface-hi`.
 *
 * NOTA: el componente legacy `app-skeleton` aceptaba `borderRadius` como input;
 * `lib-skeleton` lo elimina por construcción (regla 1 Terminal Collector). La
 * migración mapea: cualquier valor previo de `borderRadius` (50%, 6px, --radius-*)
 * se descarta — todas las skeletons son rectángulos planos.
 */
@Component({
  selector: 'app-lib-skeleton',
  standalone: true,
  imports: [NgStyle],
  templateUrl: './lib-skeleton.component.html',
  styleUrl: './lib-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibSkeletonComponent {
  /** Anchura del bloque (p.ej. '120px', '100%'). Default '100%'. */
  readonly width: InputSignal<string> = input<string>('100%');

  /** Altura del bloque (p.ej. '1rem', '120px'). Default '1rem'. */
  readonly height: InputSignal<string> = input<string>('1rem');

  /** Alias semántico opcional. No altera la geometría (siempre rectangular). */
  readonly shape: InputSignal<LibSkeletonShape> = input<LibSkeletonShape>('line');
}
