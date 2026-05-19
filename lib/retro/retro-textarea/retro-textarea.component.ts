import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  inject,
  Injector,
  input,
  InputSignal,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from '@angular/core';
import { ControlValueAccessor, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { RetroFormFieldComponent } from '../retro-form-field/retro-form-field.component';
import { RetroInputDirective } from '../retro-form-field/components/retro-input/retro-input.directive';
import { RetroLabelComponent } from '../retro-form-field/components/retro-label/retro-label.component';
import { RetroErrorComponent } from '../retro-form-field/components/retro-error/retro-error.component';
import { RetroHintComponent } from '../retro-form-field/components/retro-hint/retro-hint.component';
import {
  RETRO_FORM_FIELD_CONTROL,
  RetroFormFieldControl
} from '../retro-form-field/tokens/retro-form-field-control.token';

/**
 * Área de texto multilínea self-contained Terminal Collector.
 * Internaliza retro-form-field + retro-label + textarea[retroInput] y los gestiona
 * como una unidad. El consumidor solo usa <retro-textarea> con label y formControlName.
 *
 * Implementa ControlValueAccessor para funcionar con formControlName / ngModel.
 * Implementa RetroFormFieldControl para que el retro-form-field interno lo descubra
 * vía el token RETRO_FORM_FIELD_CONTROL.
 *
 * Uso:
 * ```html
 * <retro-textarea label="Notas" formControlName="notes" [rows]="3" />
 * ```
 */
@Component({
  selector: 'retro-textarea',
  standalone: true,
  imports: [RetroFormFieldComponent, RetroInputDirective, RetroLabelComponent, RetroErrorComponent, RetroHintComponent],
  templateUrl: './retro-textarea.component.html',
  styleUrl: './retro-textarea.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RetroTextareaComponent), multi: true },
    { provide: RETRO_FORM_FIELD_CONTROL, useExisting: forwardRef(() => RetroTextareaComponent) }
  ]
})
export class RetroTextareaComponent implements ControlValueAccessor, RetroFormFieldControl, OnInit {
  // ── Inyecciones privadas ─────────────────────────────────────────────────────

  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly _injector: Injector = inject(Injector);

  // ── Variables privadas ───────────────────────────────────────────────────────

  /** Emite true al recibir foco, false al perderlo (stream interno). */
  private readonly _focusSubject: Subject<boolean> = new Subject<boolean>();

  /** Valor interno del textarea. */
  private _internalValue: string = '';

  // ── Variables públicas readonly (RetroFormFieldControl + inputs + outputs) ───

  /** Emite true al recibir foco, false al perderlo. */
  readonly focused$: Observable<boolean> = this._focusSubject.asObservable();

  /** Verdadero cuando el control tiene un error de validación visible. */
  get errorState(): boolean {
    const ctrl = this.ngControl?.control;
    if (!ctrl) return false;
    return ctrl.invalid && (ctrl.touched || ctrl.dirty);
  }

  /** Verdadero cuando el control está deshabilitado. */
  get disabled(): boolean {
    return this.isDisabled();
  }

  /** Verdadero cuando el campo no tiene valor. */
  get empty(): boolean {
    return this._internalValue === '' || this._internalValue == null;
  }

  // ── Inputs públicos ──────────────────────────────────────────────────────────

  /** Texto del label del campo. */
  readonly label: InputSignal<string> = input<string>('');

  /** Placeholder del textarea. */
  readonly placeholder: InputSignal<string> = input<string>('');

  /** Mensaje de hint. Nulo si no hay. */
  readonly hint: InputSignal<string | null> = input<string | null>(null);

  /** Mensaje de error. Nulo si no hay. */
  readonly error: InputSignal<string | null> = input<string | null>(null);

  /** Tamaño del campo: sm (32px), md (40px), lg (44px). */
  readonly size: InputSignal<'sm' | 'md' | 'lg'> = input<'sm' | 'md' | 'lg'>('lg');

  /** Muestra el botón de limpiar cuando el campo tiene valor. */
  readonly clearable: InputSignal<boolean> = input<boolean>(false);

  /** Texto del aria-label del botón limpiar. */
  readonly clearAriaLabel: InputSignal<string> = input<string>('Limpiar');

  /** Longitud máxima permitida. Nulo para sin límite. */
  readonly maxlength: InputSignal<number | null> = input<number | null>(null);

  /** Cuando es true, el textarea es de solo lectura (no editable, pero el valor sí va al formulario). */
  readonly readonly: InputSignal<boolean> = input<boolean>(false);

  /** Número de líneas visibles del textarea. */
  readonly rows: InputSignal<number> = input<number>(3);

  /** Control del resize CSS del textarea. */
  readonly resize: InputSignal<'none' | 'vertical' | 'both'> = input<'none' | 'vertical' | 'both'>('vertical');

  // ── Signals públicos ─────────────────────────────────────────────────────────

  /** Verdadero cuando el control está deshabilitado vía setDisabledState(). */
  readonly isDisabled: WritableSignal<boolean> = signal<boolean>(false);

  /** Valor visible en el textarea nativo. */
  readonly displayValue: WritableSignal<string> = signal<string>('');

  // ── Outputs públicos ─────────────────────────────────────────────────────────

  /** Emite cuando el usuario pulsa el botón limpiar. */
  readonly cleared: OutputEmitterRef<void> = output<void>();

  /** Emite el evento blur del textarea nativo. */
  readonly blur: OutputEmitterRef<FocusEvent> = output<FocusEvent>();

  /** Emite el evento focus del textarea nativo. */
  readonly focus: OutputEmitterRef<FocusEvent> = output<FocusEvent>();

  // ── Variables públicas (no readonly) ─────────────────────────────────────────

  /**
   * NgControl del host — se obtiene en ngOnInit para evitar la dependencia circular
   * con NG_VALUE_ACCESSOR. Permite leer estado de validación (touched, dirty, invalid).
   */
  ngControl: NgControl | null = null;

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Obtener NgControl aquí para evitar NG0200 (dependencia circular con NG_VALUE_ACCESSOR).
    this.ngControl = this._injector.get(NgControl, null, { optional: true, self: true });
  }

  // ── Métodos públicos (CVA) ───────────────────────────────────────────────────

  /** @inheritdoc */
  writeValue(value: string | null): void {
    this._internalValue = value ?? '';
    this.displayValue.set(this._internalValue);
    this._cdr.markForCheck();
  }

  /** @inheritdoc */
  registerOnChange(fn: (_v: string | null) => void): void {
    this._onChangeCallback = fn;
  }

  /** @inheritdoc */
  registerOnTouched(fn: () => void): void {
    this._onTouchedCallback = fn;
  }

  /** @inheritdoc */
  setDisabledState(disabled: boolean): void {
    this.isDisabled.set(disabled);
    this._cdr.markForCheck();
  }

  // ── Métodos públicos (handlers de template) ──────────────────────────────────

  /**
   * Propaga el cambio de valor al FormControl cuando el usuario escribe.
   *
   * @param {Event} event - Evento input del textarea nativo.
   */
  onInput(event: Event): void {
    const raw: string = (event.target as HTMLTextAreaElement).value;
    this._internalValue = raw;
    this.displayValue.set(raw);
    const emitValue: string | null = raw === '' ? null : raw;
    this._onChangeCallback(emitValue);
    this._cdr.markForCheck();
  }

  /**
   * Propaga el blur y marca el control como tocado.
   *
   * @param {FocusEvent} event - Evento blur del textarea nativo.
   */
  onBlur(event: FocusEvent): void {
    this._focusSubject.next(false);
    this._onTouchedCallback();
    this.blur.emit(event);
  }

  /**
   * Notifica el foco al form-field y emite el output focus.
   *
   * @param {FocusEvent} event - Evento focus del textarea nativo.
   */
  onFocus(event: FocusEvent): void {
    this._focusSubject.next(true);
    this.focus.emit(event);
  }

  /**
   * Limpia el valor del textarea y emite los callbacks correspondientes.
   * Llamado por el botón clear del retro-form-field.
   */
  onClear(): void {
    this._internalValue = '';
    this.displayValue.set('');
    this._onChangeCallback(null);
    this._onTouchedCallback();
    this.cleared.emit();
    this._cdr.markForCheck();
  }

  // ── Métodos privados ─────────────────────────────────────────────────────────

  /**
   * Callback CVA onChange — notifica al formulario del nuevo valor.
   *
   * @param {string | null} _v - Nuevo valor.
   */
  private _onChangeCallback(_v: string | null): void {}

  /**
   * Callback CVA onTouched — marca el control como tocado.
   */
  private _onTouchedCallback(): void {}
}
