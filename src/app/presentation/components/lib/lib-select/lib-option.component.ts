import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  input,
  InputSignalWithTransform,
  signal,
  WritableSignal
} from '@angular/core';
import { LIB_OPTION_PARENT } from './lib-option-parent.token';

let _nextId: number = 0;

/**
 * Opción individual para LibSelectComponent y LibAutocompleteComponent.
 * Renderiza un <li role="option"> con soporte de aria-selected y aria-disabled.
 * Se comunica con el componente padre (select o autocomplete) vía el token
 * LIB_OPTION_PARENT cuando el padre lo proporciona.
 *
 * Uso:
 * ```html
 * <app-lib-option [value]="platform.code">{{ platform.label }}</app-lib-option>
 * ```
 */
@Component({
  selector: 'app-lib-option',
  standalone: true,
  imports: [],
  template: `
    <li
      class="lib-option"
      [class.lib-option--selected]="selected()"
      [class.lib-option--active]="active()"
      [class.lib-option--disabled]="isDisabled()"
      role="option"
      [id]="id"
      [attr.aria-selected]="selected()"
      [attr.aria-disabled]="isDisabled() || null"
      (click)="onClick()">
      <ng-content />
    </li>
  `,
  styleUrl: './lib-option.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibOptionComponent {
  private readonly _parent = inject(LIB_OPTION_PARENT, { optional: true });
  private readonly _elRef: ElementRef<HTMLElement> = inject(ElementRef);

  // ── ID único ─────────────────────────────────────────────────────────────────

  /** ID único DOM de esta opción (usado en aria-activedescendant del trigger). */
  readonly id: string = `lib-option-${++_nextId}`;

  // ── Inputs públicos ──────────────────────────────────────────────────────────

  /** Valor que se emite al seleccionar esta opción. */
  readonly value: InputSignalWithTransform<unknown, unknown> = input.required<unknown>();

  /** Desactiva la opción (no es seleccionable). Acepta boolean o string. */
  readonly disabled: InputSignalWithTransform<boolean, unknown> = input(false, { transform: booleanAttribute });

  // ── Signals internos ─────────────────────────────────────────────────────────

  /** Verdadero cuando esta opción es la seleccionada actualmente. */
  readonly selected: WritableSignal<boolean> = signal(false);

  /** Verdadero cuando esta opción tiene el highlight de teclado. */
  readonly active: WritableSignal<boolean> = signal(false);

  // ── Métodos públicos ─────────────────────────────────────────────────────────

  /**
   * Devuelve si la opción está desactivada como boolean nativo.
   * Necesario para compatibilidad con predicados de key-manager externos.
   */
  isDisabled(): boolean {
    return !!this.disabled();
  }

  /**
   * Devuelve el texto visible para type-ahead.
   */
  getLabel(): string {
    return this._elRef.nativeElement.textContent?.trim() ?? '';
  }

  /**
   * Maneja el click sobre la opción — notifica al padre si no está desactivada.
   */
  onClick(): void {
    if (this.isDisabled()) return;
    this._parent?.selectOption(this);
  }

  /**
   * Activa o desactiva el highlight de teclado en esta opción.
   *
   * @param {boolean} active - Estado de activación deseado.
   */
  setActive(active: boolean): void {
    this.active.set(active);
  }

  /**
   * Marca la opción como seleccionada o no.
   *
   * @param {boolean} selected - Estado seleccionado deseado.
   */
  setSelected(selected: boolean): void {
    this.selected.set(selected);
  }
}
