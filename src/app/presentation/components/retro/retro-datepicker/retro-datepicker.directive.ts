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
import { RetroDatepickerComponent } from './retro-datepicker.component';

/**
 * Directiva aplicada al <input> nativo para conectarlo con RetroDatepickerComponent.
 * Implementa ControlValueAccessor para funcionar con formControlName.
 *
 * Contrato del FormControl:
 * - writeValue acepta Date o string ISO (YYYY-MM-DD) — los strings se parsean
 *   como fecha local para evitar el desfase de zona horaria de `new Date('YYYY-MM-DD')`.
 * - El valor emitido a registerOnChange es siempre Date — compatible con
 *   FormControl<Date | null>, el contrato heredado de Material datepicker.
 * - Actualiza el texto visible del input (dd/MM/yyyy).
 *
 * Uso:
 * ```html
 * <input retroInput [retroDatepicker]="picker" formControlName="purchaseDate" [readonly]="true" />
 * <retro-datepicker #picker />
 * ```
 */
@Directive({
  selector: 'input[retroDatepicker]',
  standalone: true,
  providers: [{ provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RetroDatepickerDirective), multi: true }]
})
export class RetroDatepickerDirective implements ControlValueAccessor, OnInit {
  private readonly _elRef: ElementRef<HTMLInputElement> = inject(ElementRef);
  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);

  // ── Inputs públicos ──────────────────────────────────────────────────────────

  /** Referencia al RetroDatepickerComponent asociado. */
  readonly retroDatepicker: InputSignal<RetroDatepickerComponent> = input.required<RetroDatepickerComponent>();

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    const picker: RetroDatepickerComponent = this.retroDatepicker();
    picker.registerTrigger(this._elRef);

    // Suscribirse a la selección de fecha. Emite Date al FormControl
    // (compatible con FormControl<Date | null>, contrato heredado de Material).
    picker.dateSelected.subscribe((date: Date | null) => {
      this._onChangeCallback(date);
      this._onTouchedCallback();
      this._updateDisplay(date);
      this._cdr.markForCheck();
    });
  }

  // ── CVA ──────────────────────────────────────────────────────────────────────

  /** @inheritdoc */
  writeValue(value: Date | string | null): void {
    if (!value) {
      this.retroDatepicker().setDate(null);
      this._updateDisplay(null);
      return;
    }
    const date: Date | null = value instanceof Date ? (isNaN(value.getTime()) ? null : value) : this._parseLocal(value);
    if (!date) {
      this.retroDatepicker().setDate(null);
      this._updateDisplay(null);
      return;
    }
    this.retroDatepicker().setDate(date);
    this._updateDisplay(date);
  }

  /** @inheritdoc */
  registerOnChange(fn: (v: Date | null) => void): void {
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
   * Parsea un string ISO (YYYY-MM-DD) como fecha local — evita el desfase
   * causado por `new Date('YYYY-MM-DD')`, que se interpreta como UTC midnight.
   *
   * @param {string} value - String de fecha en formato YYYY-MM-DD.
   * @returns {Date | null} Fecha local o null si el formato es inválido.
   */
  private _parseLocal(value: string): Date | null {
    const match: RegExpMatchArray | null = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      const y: number = Number(match[1]);
      const m: number = Number(match[2]) - 1;
      const d: number = Number(match[3]);
      const date: Date = new Date(y, m, d);
      return isNaN(date.getTime()) ? null : date;
    }
    const fallback: Date = new Date(value);
    return isNaN(fallback.getTime()) ? null : fallback;
  }

  /**
   * Callback CVA onChange.
   *
   * @param {Date | null} _v - Nuevo valor.
   */
  private _onChangeCallback(_v: Date | null): void {}

  /**
   * Callback CVA onTouched.
   */
  private _onTouchedCallback(): void {}
}
