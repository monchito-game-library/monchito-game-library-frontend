import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  viewChildren,
} from '@angular/core';

import { RetroSegmentedOption } from './retro-segmented.types';

/**
 * Control segmentado retro que permite seleccionar una opción de un conjunto exclusivo.
 *
 * Funciona como un grupo de botones de selección única con soporte completo de
 * teclado (flechas con wrap-around, Home/End y auto-selección).
 *
 * Uso básico:
 * ```html
 * <retro-segmented
 *   [options]="options"
 *   [value]="selected"
 *   (changed)="onChanged($event)"
 * />
 * ```
 */
@Component({
  selector: 'retro-segmented',
  standalone: true,
  imports: [],
  templateUrl: './retro-segmented.component.html',
  styleUrl: './retro-segmented.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RetroSegmentedComponent<T = string> {
  // ── Inputs públicos ─────────────────────────────────────────────────────────

  /** Lista de opciones a mostrar como segmentos. */
  readonly options: InputSignal<readonly RetroSegmentedOption<T>[]> =
    input.required<readonly RetroSegmentedOption<T>[]>();

  /** Valor del segmento actualmente seleccionado. */
  readonly value: InputSignal<T | undefined> = input<T | undefined>(undefined);

  /** Etiqueta aria para el contenedor del control segmentado. */
  readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** Cuando es true, el control no responde a interacciones del usuario. */
  readonly disabled: InputSignal<boolean> = input<boolean>(false);

  // ── Outputs ─────────────────────────────────────────────────────────────────

  /** Emite el valor del segmento seleccionado al hacer clic o navegar por teclado. */
  readonly changed: OutputEmitterRef<T> = output<T>();

  // ── ViewChildren ────────────────────────────────────────────────────────────

  /** Referencias a los botones de segmento para mover el foco por teclado. */
  readonly segmentRefs: ReturnType<typeof viewChildren<ElementRef<HTMLElement>>> =
    viewChildren<ElementRef<HTMLElement>>('segmentRef');

  // ── Métodos públicos ─────────────────────────────────────────────────────────

  /**
   * Selecciona el segmento con el valor indicado y emite el evento `changed`.
   * Sin efecto si el control está deshabilitado.
   *
   * @param {T} value - Valor del segmento a seleccionar.
   */
  onSelect(value: T): void {
    if (this.disabled()) return;
    this.changed.emit(value);
  }

  /**
   * Maneja la navegación por teclado entre segmentos (patrón APG activación automática).
   * Soporta flechas con wrap-around, Home y End.
   *
   * @param {KeyboardEvent} event - Evento de teclado capturado.
   * @param {number} index - Índice del segmento que recibe el evento.
   */
  onKeydown(event: KeyboardEvent, index: number): void {
    if (this.disabled()) return;

    const total = this.options().length;
    if (total === 0) return;

    let next = index;

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        next = (index + 1) % total;
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        next = (index - 1 + total) % total;
        break;
      case 'Home':
        next = 0;
        break;
      case 'End':
        next = total - 1;
        break;
      default:
        return;
    }

    event.preventDefault();
    const nextOption = this.options()[next];
    if (nextOption) {
      this.onSelect(nextOption.value);
      this._focusSegment(next);
    }
  }

  // ── Métodos privados ─────────────────────────────────────────────────────────

  /**
   * Mueve el foco al botón de segmento del índice indicado.
   *
   * @param {number} index - Índice del segmento al que mover el foco.
   */
  private _focusSegment(index: number): void {
    const ref = this.segmentRefs()[index];
    ref?.nativeElement.focus();
  }
}
