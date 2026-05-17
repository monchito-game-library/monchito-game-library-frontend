import {
  ChangeDetectionStrategy,
  Component,
  effect,
  forwardRef,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LibCheckboxSize } from '@/types/lib-component.type';

/**
 * Checkbox terminal `[X] / [ ]` reutilizable de la lib Terminal Collector.
 * Compatible con `formControlName` y `[(ngModel)]` (ControlValueAccessor completo).
 * Reemplaza `app-toggle-switch` (deprecado): mismo contrato `(changed)` + CVA,
 * pero patrón visual `[X]/[ ]` mono en vez de pildora con thumb.
 * Sin animación de transición — el cambio entre `[X]` y `[ ]` es discreto
 * (frame único, regla 3 Terminal Collector).
 */
@Component({
  selector: 'app-lib-checkbox',
  standalone: true,
  imports: [],
  templateUrl: './lib-checkbox.component.html',
  styleUrl: './lib-checkbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LibCheckboxComponent), multi: true }]
})
export class LibCheckboxComponent implements ControlValueAccessor {
  // ── Campos privados ──────────────────────────────────────────────────────────

  private _cvaMode: boolean = false;

  // ── Inputs públicos ──────────────────────────────────────────────────────────

  /** Estado checked (modo standalone — se ignora si hay formControlName). */
  readonly checked: InputSignal<boolean> = input<boolean>(false);

  /** Etiqueta opcional a la derecha del control, mono uppercase. */
  readonly label: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /** Tamaño del glyph: 'sm' (0.875rem) o 'md' (1rem, default). */
  readonly size: InputSignal<LibCheckboxSize> = input<LibCheckboxSize>('md');

  /** Deshabilita el control (modo standalone — CVA usa setDisabledState). */
  readonly disabled: InputSignal<boolean> = input<boolean>(false);

  // ── Outputs ──────────────────────────────────────────────────────────────────

  /** Emite el nuevo valor booleano tras cada interacción. */
  readonly changed: OutputEmitterRef<boolean> = output<boolean>();

  // ── Signals internos (público por acceso de template) ───────────────────────

  /** Valor interno, alimentado por [checked] (standalone) o writeValue (CVA). */
  readonly _value: WritableSignal<boolean> = signal(false);

  /** Disabled interno, alimentado por [disabled] (standalone) o setDisabledState (CVA). */
  readonly _isDisabled: WritableSignal<boolean> = signal(false);

  // ── Constructor ──────────────────────────────────────────────────────────────

  constructor() {
    // Sincronización [checked] → _value en modo standalone.
    // En modo CVA, writeValue se encarga de actualizar _value.
    effect(() => {
      if (!this._cvaMode) {
        this._value.set(this.checked());
      }
    });

    // Sincronización [disabled] → _isDisabled en modo standalone.
    effect(() => {
      if (!this._cvaMode) {
        this._isDisabled.set(this.disabled());
      }
    });
  }

  // ── Métodos públicos (CVA + handler) ─────────────────────────────────────────

  /** @inheritdoc */
  writeValue(v: boolean): void {
    this._value.set(!!v);
  }

  /** @inheritdoc */
  registerOnChange(fn: (v: boolean) => void): void {
    this._onChangeCallback = fn;
    this._cvaMode = true;
  }

  /** @inheritdoc */
  registerOnTouched(fn: () => void): void {
    this._onTouchedCallback = fn;
  }

  /** @inheritdoc */
  setDisabledState(d: boolean): void {
    this._isDisabled.set(d);
  }

  /**
   * Toggla el valor, notifica a Forms y emite (changed).
   * No hace nada si el control está deshabilitado.
   */
  onToggle(): void {
    if (this._isDisabled()) return;
    const v: boolean = !this._value();
    this._value.set(v);
    this._onChangeCallback(v);
    this._onTouchedCallback();
    this.changed.emit(v);
  }

  // ── Métodos privados (callbacks CVA) ─────────────────────────────────────────

  /**
   * Callback registrado por Angular Forms al conectar un control reactivo.
   * Notifica al formulario del nuevo valor tras cada toggle.
   *
   * @param {boolean} _v - Nuevo valor booleano.
   */
  private _onChangeCallback(_v: boolean): void {}

  /**
   * Callback registrado por Angular Forms para marcar el control como tocado.
   */
  private _onTouchedCallback(): void {}
}
