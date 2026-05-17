import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { RetroIconComponent } from '@/components/retro/retro-icon/retro-icon.component';
import { LibButtonType, LibButtonVariant } from '@/types/retro-component.type';

/**
 * Botón reutilizable de la lib Terminal Collector.
 * En desktop muestra corchetes `[ LABEL ]` via pseudo-elementos.
 * En mobile (≤ 768px) los corchetes se ocultan.
 */
@Component({
  selector: 'retro-button',
  standalone: true,
  imports: [RetroIconComponent],
  templateUrl: './retro-button.component.html',
  styleUrl: './retro-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroButtonComponent {
  /** Texto del botón, en uppercase en pantalla. */
  readonly label: InputSignal<string> = input.required<string>();

  /** Nombre del icono de Material Icons. Opcional. */
  readonly icon: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** Variante visual del botón. */
  readonly variant: InputSignal<LibButtonVariant> = input<LibButtonVariant>('ghost');

  /** Deshabilita el botón cuando es true. */
  readonly disabled: InputSignal<boolean> = input<boolean>(false);

  /** Muestra un spinner de carga y deshabilita el botón. */
  readonly loading: InputSignal<boolean> = input<boolean>(false);

  /** Tipo del elemento button HTML nativo. */
  readonly type: InputSignal<LibButtonType> = input<LibButtonType>('button');

  /** Si es true, el botón ocupa todo el ancho disponible. */
  readonly fullWidth: InputSignal<boolean> = input<boolean>(false);

  /** Emite el MouseEvent al hacer clic (solo si no está deshabilitado ni en loading). */
  readonly clicked: OutputEmitterRef<MouseEvent> = output<MouseEvent>();
}
