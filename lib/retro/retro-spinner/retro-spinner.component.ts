import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';
import { LibSpinnerSize, LibSpinnerVariant } from './retro-spinner.types';

/**
 * Spinner ASCII reutilizable de la lib Terminal Collector.
 * Sin Material. Animación CSS pura con frames discretos sobre `::before`.
 * En `prefers-reduced-motion` se muestra un frame estático.
 */
@Component({
  selector: 'retro-spinner',
  standalone: true,
  templateUrl: './retro-spinner.component.html',
  styleUrl: './retro-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroSpinnerComponent {
  /** Tamaño visual: 'inline' (1ch, dentro de un botón/línea), 'sm' (18-20px), 'md' (40-48px), 'lg' (80px). */
  readonly size: InputSignal<LibSpinnerSize> = input<LibSpinnerSize>('md');

  /** Variante de glyph: 'bars' (|/-\\), 'dots' (... → ....), 'blocks' (▖▘▝▗). Default 'bars'. */
  readonly variant: InputSignal<LibSpinnerVariant> = input<LibSpinnerVariant>('bars');

  /** Texto accesible para lectores de pantalla. Default 'Loading'. */
  readonly ariaLabel: InputSignal<string> = input<string>('Loading');
}
