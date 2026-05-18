import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';

/**
 * Barra de prompt de terminal decorativa de la lib Terminal Collector.
 * Solo visible en desktop >= 1024px (oculto en tablet y mobile via CSS).
 * Puramente decorativa (aria-hidden). Muestra: `PATH $ --flag1 --flag2 ▋`
 */
@Component({
  selector: 'retro-command-bar',
  standalone: true,
  imports: [],
  templateUrl: './retro-command-bar.component.html',
  styleUrl: './retro-command-bar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroCommandBarComponent {
  /** Ruta del prompt, p.ej. `monchito ~/library/games`. */
  readonly path: InputSignal<string> = input<string>('monchito ~/library');

  /** Array de flags mostrados como `--flag`. */
  readonly flags: InputSignal<readonly string[]> = input<readonly string[]>([]);

  /** Si true, muestra el cursor parpadeante. */
  readonly cursor: InputSignal<boolean> = input<boolean>(true);
}
