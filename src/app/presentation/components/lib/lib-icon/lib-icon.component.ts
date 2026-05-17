import { ChangeDetectionStrategy, Component, InputSignal, input } from '@angular/core';

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
  templateUrl: './lib-icon.component.html',
  styleUrl: './lib-icon.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibIconComponent {
  /** Nombre del icono Material Icons (liga de la webfont). */
  readonly name: InputSignal<string> = input.required<string>();

  /** Tamaño del icono. */
  readonly size: InputSignal<'sm' | 'md' | 'lg'> = input<'sm' | 'md' | 'lg'>('md');

  /** Oculta el icono a los lectores de pantalla cuando es decorativo. */
  readonly ariaHidden: InputSignal<boolean> = input<boolean>(true);
}
