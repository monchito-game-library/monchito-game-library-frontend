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
import { RetroIconComponent } from '../retro-icon/retro-icon.component';
import {
  RETRO_FORM_FIELD_CONTROL,
  RetroFormFieldControl
} from '../retro-form-field/tokens/retro-form-field-control.token';

/**
 * Campo de texto self-contained Terminal Collector.
 * Internaliza retro-form-field + retro-label + input[retroInput] y los gestiona
 * como una unidad. El consumidor solo usa <retro-input> con label y formControlName.
 *
 * Implementa ControlValueAccessor para funcionar con formControlName / ngModel.
 * Implementa RetroFormFieldControl para que el retro-form-field interno lo descubra
 * vía el token RETRO_FORM_FIELD_CONTROL.
 *
 * Uso:
 * ```html
 * <retro-input label="Título" formControlName="title" placeholder="Ej: Super Mario" />
 * ```
 */
@Component({
  selector: 'retro-input',
  standalone: true,
  imports: [
    RetroFormFieldComponent,
    RetroInputDirective,
    RetroLabelComponent,
    RetroErrorComponent,
    RetroHintComponent,
    RetroIconComponent
  ],
  templateUrl: './retro-input.component.html',
  styleUrl: './retro-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RetroInputComponent), multi: true },
    { provide: RETRO_FORM_FIELD_CONTROL, useExisting: forwardRef(() => RetroInputComponent) }
  ]
})
export class RetroInputComponent implements ControlValueAccessor, RetroFormFieldControl, OnInit {
  // ── Inyecciones privadas ─────────────────────────────────────────────────────

  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly _injector: Injector = inject(Injector);
  private readonly _focusSubject: Subject<boolean> = new Subject<boolean>();

  // ── Variables privadas ───────────────────────────────────────────────────────

  /** Valor interno del input. */
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
    return this._isDisabled();
  }

  /** Verdadero cuando el campo no tiene valor. */
  get empty(): boolean {
    return this._internalValue === '' || this._internalValue == null;
  }

  // ── Inputs públicos ──────────────────────────────────────────────────────────

  /** Texto del label del campo. Vacío si el consumidor no ha migrado aún a la API self-contained. */
  readonly label: InputSignal<string> = input<string>('');

  /** Placeholder del input. */
  readonly placeholder: InputSignal<string> = input<string>('');

  /** Mensaje de hint. Nulo si no hay. */
  readonly hint: InputSignal<string | null> = input<string | null>(null);

  /** Mensaje de error. Nulo si no hay. */
  readonly error: InputSignal<string | null> = input<string | null>(null);

  /** Tamaño del campo: sm (32px), md (40px), lg (44px). */
  readonly size: InputSignal<'sm' | 'md' | 'lg'> = input<'sm' | 'md' | 'lg'>('lg');

  /** Icono decorativo en el prefix. */
  readonly prefixIcon: InputSignal<string | null> = input<string | null>(null);

  /** Texto corto mostrado como prefijo de prompt de terminal (p.ej. "$ "). Mutuamente excluyente con prefixIcon. */
  readonly prefixText: InputSignal<string | null> = input<string | null>(null);

  /** Icono decorativo en el suffix. */
  readonly suffixIcon: InputSignal<string | null> = input<string | null>(null);

  /** Muestra el botón de limpiar cuando el campo tiene valor. */
  readonly clearable: InputSignal<boolean> = input<boolean>(false);

  /** Texto del aria-label del botón limpiar. */
  readonly clearAriaLabel: InputSignal<string> = input<string>('Limpiar');

  /** Oculta el bloque subscript (hint/error) del form-field interno. Útil en campos de búsqueda sin validación visible. */
  readonly hideSubscript: InputSignal<boolean> = input<boolean>(false);

  /** Tipo del input nativo. */
  readonly type: InputSignal<'text' | 'email' | 'password' | 'number' | 'tel' | 'url'> = input<
    'text' | 'email' | 'password' | 'number' | 'tel' | 'url'
  >('text');

  /** Atributo autocomplete del input nativo. */
  readonly autocomplete: InputSignal<string> = input<string>('off');

  /** Longitud máxima permitida. Nulo para sin límite. */
  readonly maxlength: InputSignal<number | null> = input<number | null>(null);

  /** Cuando es true, el input nativo es de solo lectura (no editable, pero el valor sí va al formulario). */
  readonly readonly: InputSignal<boolean> = input<boolean>(false);

  // ── Signals públicos ─────────────────────────────────────────────────────────

  /** Verdadero cuando el control está deshabilitado vía setDisabledState(). */
  readonly _isDisabled: WritableSignal<boolean> = signal<boolean>(false);

  /** Valor visible en el input nativo. */
  readonly _displayValue: WritableSignal<string> = signal<string>('');

  // ── Outputs públicos ─────────────────────────────────────────────────────────

  /** Emite cuando el usuario pulsa el botón limpiar. */
  readonly cleared: OutputEmitterRef<void> = output<void>();

  /** Emite el evento blur del input nativo. */
  readonly blur: OutputEmitterRef<FocusEvent> = output<FocusEvent>();

  /** Emite el evento focus del input nativo. */
  readonly focus: OutputEmitterRef<FocusEvent> = output<FocusEvent>();

  /** Emite al pulsar Enter en el input. */
  readonly enter: OutputEmitterRef<KeyboardEvent> = output<KeyboardEvent>();

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
    this._displayValue.set(this._internalValue);
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
    this._isDisabled.set(disabled);
    this._cdr.markForCheck();
  }

  // ── Métodos públicos (handlers de template) ──────────────────────────────────

  /**
   * Propaga el cambio de valor al FormControl cuando el usuario escribe.
   *
   * @param {Event} event - Evento input del input nativo.
   */
  onInput(event: Event): void {
    const value: string = (event.target as HTMLInputElement).value;
    this._internalValue = value;
    this._displayValue.set(value);
    this._onChangeCallback(value);
    this._cdr.markForCheck();
  }

  /**
   * Propaga el blur y marca el control como tocado.
   *
   * @param {FocusEvent} event - Evento blur del input nativo.
   */
  onBlur(event: FocusEvent): void {
    this._focusSubject.next(false);
    this._onTouchedCallback();
    this.blur.emit(event);
  }

  /**
   * Notifica el foco al form-field y emite el output focus.
   *
   * @param {FocusEvent} event - Evento focus del input nativo.
   */
  onFocus(event: FocusEvent): void {
    this._focusSubject.next(true);
    this.focus.emit(event);
  }

  /**
   * Emite el output enter cuando el usuario pulsa Enter.
   *
   * @param {KeyboardEvent} event - Evento keydown del input nativo.
   */
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.enter.emit(event);
    }
  }

  /**
   * Limpia el valor del input y emite los callbacks correspondientes.
   * Llamado por el botón clear del retro-form-field.
   * emptyValue: '' — nunca emite null al formulario.
   */
  onClear(): void {
    this._internalValue = '';
    this._displayValue.set('');
    this._onChangeCallback('');
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
