import { ChangeDetectionStrategy, Component, HostBinding, InputSignal, input } from '@angular/core';
import { LibIconSize } from './retro-icon.types';

/**
 * Icono reutilizable de la lib Terminal Collector.
 * Renderiza un <span class="material-icons"> usando la webfont Material Icons
 * ya cargada en index.html. Paridad funcional con mat-icon sin dependencia de
 * @angular/material/icon.
 *
 * A11y:
 * - aria-hidden="true" por defecto (decorativo).
 * - Para iconos informativos, el call-site añade aria-label al contenedor padre.
 *
 * Deuda a11y: ninguna; es paridad funcional con mat-icon.
 */
@Component({
  selector: 'retro-icon',
  standalone: true,
  templateUrl: './retro-icon.component.html',
  styleUrl: './retro-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroIconComponent {
  /** Nombre del icono Material Icons (liga de la webfont). */
  readonly name: InputSignal<string> = input.required<string>();

  /** Tamaño del icono. */
  readonly size: InputSignal<LibIconSize> = input<LibIconSize>('md');

  /** Oculta el icono a los lectores de pantalla cuando es decorativo. */
  readonly ariaHidden: InputSignal<boolean> = input<boolean>(true);

  /** Aplica la clase de variante de tamaño al host para que :host.retro-icon-host--* funcione. */
  @HostBinding('class') get sizeClass(): string {
    return `retro-icon-host--${this.size()}`;
  }
}
