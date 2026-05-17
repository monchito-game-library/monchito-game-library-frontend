import { ChangeDetectionStrategy, Component, InputSignal, OutputEmitterRef, input, output } from '@angular/core';
import { LibIconComponent } from '@/components/lib/lib-icon/lib-icon.component';
import { LibIconButtonSize, LibIconButtonVariant, LibButtonType } from '@/types/lib-component.type';

/**
 * Botón de icono reutilizable de la lib Terminal Collector.
 * `<button>` nativo + `<mat-icon>` interno (mat-icon es contenido tipográfico,
 * no UI Material). Sin ripple, sin Material Buttons. Borde 1px en hover.
 */
@Component({
  selector: 'retro-icon-button',
  standalone: true,
  imports: [LibIconComponent],
  templateUrl: './lib-icon-button.component.html',
  styleUrl: './lib-icon-button.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibIconButtonComponent {
  /** Nombre del icono Material Icons (font-set por defecto). */
  readonly icon: InputSignal<string> = input.required<string>();

  /** Etiqueta accesible obligatoria — no hay texto visible. */
  readonly ariaLabel: InputSignal<string> = input.required<string>();

  /** Variante visual del botón. */
  readonly variant: InputSignal<LibIconButtonVariant> = input<LibIconButtonVariant>('ghost');

  /** Tamaño base: 'sm' (32) para matSuffix, 'md' (40) topbars, 'lg' (44) standalone mobile. */
  readonly size: InputSignal<LibIconButtonSize> = input<LibIconButtonSize>('md');

  /** Deshabilita el botón cuando es true. */
  readonly disabled: InputSignal<boolean> = input<boolean>(false);

  /** Tipo del elemento button HTML nativo. */
  readonly type: InputSignal<LibButtonType> = input<LibButtonType>('button');

  /** Emite el MouseEvent al hacer clic (solo si no está deshabilitado). */
  readonly clicked: OutputEmitterRef<MouseEvent> = output<MouseEvent>();
}
