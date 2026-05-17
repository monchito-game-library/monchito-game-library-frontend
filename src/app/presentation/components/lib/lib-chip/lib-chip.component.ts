import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { LibIconComponent } from '@/components/lib/lib-icon/lib-icon.component';
import { LibChipColor } from '@/types/lib-component.type';

/**
 * Chip/badge reutilizable de la lib Terminal Collector.
 * Borde 1px del color del variant, texto mono uppercase 0.6875rem, border-radius: 0.
 * Con filled=true usa fondo del color y texto void (para overlays hero).
 * Con closable=true muestra un botón X y emite closed.
 */
@Component({
  selector: 'app-lib-chip',
  standalone: true,
  imports: [LibIconComponent],
  templateUrl: './lib-chip.component.html',
  styleUrl: './lib-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibChipComponent {
  /** Texto visible del chip, en uppercase en pantalla. */
  readonly label: InputSignal<string> = input.required<string>();

  /** Nombre del icono de Material Icons. Opcional. */
  readonly icon: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** Color semántico del chip. */
  readonly color: InputSignal<LibChipColor> = input<LibChipColor>('neutral');

  /** Si true, aplica fondo sólido del color y texto --bg-void (para hero overlays). */
  readonly filled: InputSignal<boolean> = input<boolean>(false);

  /** Si true, muestra un botón de cierre y emite el evento closed. */
  readonly closable: InputSignal<boolean> = input<boolean>(false);

  /** Emite cuando el usuario hace clic en el botón de cierre del chip. */
  readonly closed: OutputEmitterRef<void> = output<void>();
}
