import {
  ChangeDetectionStrategy,
  Component,
  InputSignal,
  OutputEmitterRef,
  Signal,
  computed,
  input,
  output
} from '@angular/core';
import { RetroIconComponent } from '@/components/retro/retro-icon/retro-icon.component';
import { LibIconSize } from '@/types/retro-icon.type';
import { RetroChipColor, RetroChipSize } from '@/types/retro-chip.type';

/**
 * Chip/badge reutilizable de la lib Terminal Collector.
 * Borde 1px del color del variant, texto mono uppercase, border-radius: 0.
 * Con filled=true usa fondo del color y texto void (para overlays hero).
 * Con closable=true muestra un botón X y emite closed.
 *
 * Tamaños: sm (denso, tablas), md (default), lg (destacado, headers).
 */
@Component({
  selector: 'retro-chip',
  standalone: true,
  imports: [RetroIconComponent],
  templateUrl: './retro-chip.component.html',
  styleUrl: './retro-chip.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroChipComponent {
  /** Texto visible del chip, en uppercase en pantalla. */
  readonly label: InputSignal<string> = input.required<string>();

  /** Nombre del icono de Material Icons. Opcional. */
  readonly icon: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** Color semántico del chip. */
  readonly color: InputSignal<RetroChipColor> = input<RetroChipColor>('neutral');

  /** Tamaño del chip: sm (denso), md (default), lg (destacado). */
  readonly size: InputSignal<RetroChipSize> = input<RetroChipSize>('md');

  /** Si true, aplica fondo sólido del color y texto --bg-void (para hero overlays). */
  readonly filled: InputSignal<boolean> = input<boolean>(false);

  /** Si true, muestra un botón de cierre y emite el evento closed. */
  readonly closable: InputSignal<boolean> = input<boolean>(false);

  /** Emite cuando el usuario hace clic en el botón de cierre del chip. */
  readonly closed: OutputEmitterRef<void> = output<void>();

  /** Tamaño del icono interno derivado del tamaño del chip. */
  readonly iconSize: Signal<LibIconSize> = computed<LibIconSize>(() => (this.size() === 'lg' ? 'sm' : 'xs'));
}
