import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  forwardRef,
  inject,
  input,
  InputSignal,
  OnInit
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { LibDatepickerComponent } from './lib-datepicker.component';

/**
 * Directiva aplicada al <input> nativo para conectarlo con LibDatepickerComponent.
 * Implementa ControlValueAccessor para funcionar con formControlName.
 *
 * Al seleccionar una fecha en el calendario:
 * - Actualiza el valor del FormControl (formato ISO YYYY-MM-DD).
 * - Actualiza el texto visible del input (dd/MM/yyyy).
 *
 * Uso:
 * ```html
 * <input libInput [libDatepicker]="picker" formControlName="purchaseDate" [readonly]="true" />
 * <app-lib-datepicker #picker />
 * ```
 */
@Directive({
  selector: 'input[libDatepicker]',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LibDatepickerDirective), multi: true }]
})
export class LibDatepickerDirective implements ControlValueAccessor, OnInit {
  private readonly _elRef: ElementRef<HTMLInputElement> = inject(ElementRef);
  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  // ── Inputs públicos ──────────────────────────────────────────────────────────

  /** Referencia al LibDatepickerComponent asociado. */
  readonly libDatepicker: InputSignal<LibDatepickerComponent> = input.required<LibDatepickerComponent>();

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const picker: LibDatepickerComponent = this.libDatepicker();
    picker.registerTrigger(this._elRef);

    // Suscribirse a la selección de fecha.
    picker.dateSelected.subscribe((date: Date | null) => {
      const isoValue: string | null = date ? this._toIso(date) : null;
      this._onChangeCallback(isoValue);
      this._onTouchedCallback();
      this._updateDisplay(date);
      this._cdr.markForCheck();
    });
  }

  // ── CVA ──────────────────────────────────────────────────────────────────────

  /** @inheritdoc */
  writeValue(value: string | null): void {
    if (!value) {
      this.libDatepicker().setDate(null);
      this._updateDisplay(null);
      return;
    }
    const date: Date = new Date(value);
    // Ignorar valores de fecha inválidos silenciosamente.
    if (isNaN(date.getTime())) {
      this.libDatepicker().setDate(null);
      this._updateDisplay(null);
      return;
    }
    this.libDatepicker().setDate(date);
    this._updateDisplay(date);
  }

  /** @inheritdoc */
  registerOnChange(fn: (v: string | null) => void): void {
    this._onChangeCallback = fn;
  }

  /** @inheritdoc */
  registerOnTouched(fn: () => void): void {
    this._onTouchedCallback = fn;
  }

  /** @inheritdoc */
  setDisabledState(disabled: boolean): void {
    this._elRef.nativeElement.disabled = disabled;
  }

  // ── Métodos privados ─────────────────────────────────────────────────────────

  /**
   * Actualiza el texto visible del input nativo con el formato dd/MM/yyyy.
   *
   * @param {Date | null} date - Fecha a mostrar.
   */
  private _updateDisplay(date: Date | null): void {
    if (!date) {
      this._elRef.nativeElement.value = '';
      return;
    }
    const fmt: string = new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
    this._elRef.nativeElement.value = fmt;
  }

  /**
   * Convierte una fecha a formato ISO YYYY-MM-DD.
   *
   * @param {Date} date - Fecha a convertir.
   */
  private _toIso(date: Date): string {
    const y: number = date.getFullYear();
    const m: string = String(date.getMonth() + 1).padStart(2, '0');
    const d: string = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Callback CVA onChange.
   *
   * @param {string | null} _v - Nuevo valor.
   */
  private _onChangeCallback(_v: string | null): void {}

  /**
   * Callback CVA onTouched.
   */
  private _onTouchedCallback(): void {}
}
