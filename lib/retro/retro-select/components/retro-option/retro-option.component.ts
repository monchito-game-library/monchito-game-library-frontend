import {
  AfterViewInit,
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
import { RETRO_OPTION_PARENT } from '../../tokens/retro-option-parent.token';

let _nextId: number = 0;

/**
 * Opción individual para RetroSelectComponent y RetroSearchComponent.
 * Renderiza un <li role="option"> con soporte de aria-selected y aria-disabled.
 * Se comunica con el componente padre (select o search) vía el token
 * RETRO_OPTION_PARENT cuando el padre lo proporciona.
 *
 * Uso:
 * ```html
 * <retro-option [value]="platform.code">{{ platform.label }}</retro-option>
 * ```
 */
@Component({
  selector: 'retro-option',
  standalone: true,
  imports: [],
  template: `
    <li
      class="retro-option"
      [class.retro-option--selected]="selected()"
      [class.retro-option--active]="active()"
      [class.retro-option--disabled]="isDisabled()"
      role="option"
      [id]="id"
      [attr.aria-selected]="selected()"
      [attr.aria-disabled]="isDisabled() || null"
      (click)="onClick()">
      <ng-content />
    </li>
  `,
  styleUrl: './retro-option.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroOptionComponent implements AfterViewInit {
  private readonly _parent = inject(RETRO_OPTION_PARENT, { optional: true });
  private readonly _elRef: ElementRef<HTMLElement> = inject(ElementRef);

  // ── Cache de label ───────────────────────────────────────────────────────────

  private _labelCache: string | null = null;

  // ── ID único ─────────────────────────────────────────────────────────────────

  /** ID único DOM de esta opción (usado en aria-activedescendant del trigger). */
  readonly id: string = `retro-option-${++_nextId}`;

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

  // ── Lifecycle hooks ──────────────────────────────────────────────────────────

  ngAfterViewInit(): void {
    this._labelCache = this._computeLabel();
  }

  // ── Métodos públicos ─────────────────────────────────────────────────────────

  /**
   * Devuelve si la opción está desactivada como boolean nativo.
   * Necesario para compatibilidad con predicados de key-manager externos.
   */
  isDisabled(): boolean {
    return !!this.disabled();
  }

  /**
   * Devuelve el texto visible para type-ahead, excluyendo el contenido de iconos
   * (retro-icon, .material-icons) para que el trigger no muestre el nombre del icono.
   * El resultado se cachea tras ngAfterViewInit para evitar clones DOM repetidos.
   */
  getLabel(): string {
    return this._labelCache ?? this._computeLabel();
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

  // ── Métodos privados ─────────────────────────────────────────────────────────

  /**
   * Extrae el texto visible de la opción clonando el DOM y eliminando iconos.
   * Esta operación es costosa — llamar solo para poblar el cache.
   */
  private _computeLabel(): string {
    const clone: HTMLElement = this._elRef.nativeElement.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('retro-icon, .material-icons').forEach((el) => el.remove());
    return clone.textContent?.trim() ?? '';
  }
}
