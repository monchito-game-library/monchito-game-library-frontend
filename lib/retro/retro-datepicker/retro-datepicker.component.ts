import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  InputSignal,
  OnDestroy,
  OnInit,
  output,
  OutputEmitterRef,
  signal,
  ViewChild,
  ViewContainerRef,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal, PortalModule } from '@angular/cdk/portal';
import { TemplateRef } from '@angular/core';
import { RetroFormFieldComponent } from '../retro-form-field/retro-form-field.component';
import { RetroInputDirective } from '../retro-form-field/components/retro-input/retro-input.directive';
import { RetroLabelComponent } from '../retro-form-field/components/retro-label/retro-label.component';
import { RetroErrorComponent } from '../retro-form-field/components/retro-error/retro-error.component';
import { RetroHintComponent } from '../retro-form-field/components/retro-hint/retro-hint.component';
import { RetroIconComponent } from '../retro-icon/retro-icon.component';
import { RetroIconButtonComponent } from '../retro-icon-button/retro-icon-button.component';
import {
  RETRO_FORM_FIELD_CONTROL,
  RetroFormFieldControl
} from '../retro-form-field/tokens/retro-form-field-control.token';
import { RETRO_DATEPICKER_DAY_HEADERS } from './constants/retro-datepicker-day-headers.constant';
import { RetroDatepickerDay } from './interfaces/retro-datepicker-day.interface';

let _nextDatepickerId: number = 0;

/**
 * Datepicker Terminal Collector — componente self-contained.
 * Internaliza retro-form-field, input nativo y el panel de calendario.
 * El consumidor solo usa <retro-datepicker label="..." formControlName="...">
 *
 * Implementa ControlValueAccessor para funcionar con formControlName / ngModel.
 * Implementa RetroFormFieldControl para comunicarse con el retro-form-field interno.
 *
 * Contrato del FormControl:
 * - writeValue acepta Date o string ISO (YYYY-MM-DD).
 * - El valor emitido a registerOnChange es siempre Date.
 * - El texto visible en el input es dd/MM/yyyy.
 *
 * Patrón ARIA: APG Date Picker Dialog Grid Pattern.
 * - Dialog: role="dialog", aria-modal="true", aria-labelledby (mes + año).
 * - Grid: role="grid".
 *
 * Uso:
 * ```html
 * <retro-datepicker label="Fecha de compra" formControlName="purchaseDate" />
 * ```
 */
@Component({
  selector: 'retro-datepicker',
  standalone: true,
  imports: [
    PortalModule,
    RetroFormFieldComponent,
    RetroInputDirective,
    RetroLabelComponent,
    RetroErrorComponent,
    RetroHintComponent,
    RetroIconComponent,
    RetroIconButtonComponent
  ],
  templateUrl: './retro-datepicker.component.html',
  styleUrl: './retro-datepicker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RetroDatepickerComponent), multi: true },
    { provide: RETRO_FORM_FIELD_CONTROL, useExisting: forwardRef(() => RetroDatepickerComponent) }
  ]
})
export class RetroDatepickerComponent implements ControlValueAccessor, RetroFormFieldControl, OnInit, OnDestroy {
  // ── Inyecciones privadas ─────────────────────────────────────────────────────

  private readonly _overlay: Overlay = inject(Overlay);
  private readonly _viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _elRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _injector: Injector = inject(Injector);
  private readonly _focusSubject: Subject<boolean> = new Subject<boolean>();

  /** Input nativo interno. */
  @ViewChild('inputEl')
  private readonly _inputEl!: ElementRef<HTMLInputElement>;

  /** Template del calendario. */
  @ViewChild('calendar')
  private readonly _calendarTemplate!: TemplateRef<unknown>;

  // ── Variables privadas ───────────────────────────────────────────────────────

  private _overlayRef: OverlayRef | null = null;

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

  /** Verdadero cuando no hay fecha seleccionada. */
  get empty(): boolean {
    return this._selectedDate() === null;
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

  /** Muestra el botón de limpiar cuando hay fecha seleccionada. */
  readonly clearable: InputSignal<boolean> = input<boolean>(false);

  /** Texto del aria-label del botón limpiar. */
  readonly clearAriaLabel: InputSignal<string> = input<string>('Limpiar');

  /** Fecha mínima seleccionable. */
  readonly min: InputSignal<Date | null> = input<Date | null>(null);

  /** Fecha máxima seleccionable. */
  readonly max: InputSignal<Date | null> = input<Date | null>(null);

  // ── Signals públicos ─────────────────────────────────────────────────────────

  /** Verdadero cuando el control está deshabilitado. */
  readonly _isDisabled: WritableSignal<boolean> = signal<boolean>(false);

  /** Mes/año visible actualmente en el calendario. */
  readonly _viewDate: WritableSignal<Date> = signal<Date>(new Date());

  /** Fecha actualmente seleccionada. */
  readonly _selectedDate: WritableSignal<Date | null> = signal<Date | null>(null);

  /** Fecha activa en el grid (la que tiene tabindex=0). */
  readonly _activeDate: WritableSignal<Date | null> = signal<Date | null>(null);

  /** Texto visible en el input nativo (dd/MM/yyyy). */
  readonly _displayText: WritableSignal<string> = signal<string>('');

  /** Verdadero cuando el panel está abierto. */
  readonly _isOpen: WritableSignal<boolean> = signal<boolean>(false);

  /** Semanas calculadas para el mes visible. */
  readonly weeks: WritableSignal<RetroDatepickerDay[][]> = signal<RetroDatepickerDay[][]>([]);

  /** Label del header (mes año en es-ES). */
  readonly headerLabel: WritableSignal<string> = signal<string>('');

  // ── Outputs públicos ─────────────────────────────────────────────────────────

  /** Emite cuando el usuario pulsa el botón limpiar. */
  readonly cleared: OutputEmitterRef<void> = output<void>();

  // ── Constantes públicas ──────────────────────────────────────────────────────

  /** Cabeceras de días de la semana. */
  readonly dayHeaders: string[] = RETRO_DATEPICKER_DAY_HEADERS;

  // ── IDs ──────────────────────────────────────────────────────────────────────

  readonly headerId: string = `retro-datepicker-header-${++_nextDatepickerId}`;

  // ── Variables públicas (no readonly) ─────────────────────────────────────────

  /**
   * NgControl del host — se obtiene en ngOnInit para evitar la dependencia circular
   * con NG_VALUE_ACCESSOR. Permite leer estado de validación.
   */
  ngControl: NgControl | null = null;

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Obtener NgControl aquí para evitar NG0200 (dependencia circular con NG_VALUE_ACCESSOR).
    this.ngControl = this._injector.get(NgControl, null, { optional: true, self: true });
  }

  ngOnDestroy(): void {
    this._overlayRef?.dispose();
  }

  // ── Métodos públicos (CVA) ───────────────────────────────────────────────────

  /** @inheritdoc */
  writeValue(value: Date | string | null): void {
    if (!value) {
      this._selectedDate.set(null);
      this._displayText.set('');
      this._rebuildCalendar(this._viewDate());
      this._cdr.markForCheck();
      return;
    }
    const date: Date | null =
      value instanceof Date ? (isNaN(value.getTime()) ? null : value) : this._parseLocal(String(value));
    if (!date) {
      this._selectedDate.set(null);
      this._displayText.set('');
    } else {
      this._selectedDate.set(date);
      this._viewDate.set(new Date(date.getFullYear(), date.getMonth(), 1));
      this._displayText.set(this._formatDate(date));
    }
    this._rebuildCalendar(this._viewDate());
    this._cdr.markForCheck();
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
    this._isDisabled.set(disabled);
    this._cdr.markForCheck();
  }

  // ── Métodos públicos (handlers de template) ──────────────────────────────────

  /**
   * Alterna el estado del calendario: lo abre si está cerrado, lo cierra si está abierto.
   * Llamado por el retro-icon-button del suffix.
   */
  toggle(): void {
    if (this._isDisabled()) return;
    this._isOpen() ? this.close() : this._openPanel();
  }

  /**
   * Abre el calendario al pulsar el icono de toggle.
   */
  openCalendar(): void {
    if (this._isDisabled() || this._isOpen()) return;
    this._openPanel();
  }

  /**
   * Cierra el calendario.
   */
  close(): void {
    this._overlayRef?.detach();
    this._overlayRef?.dispose();
    this._overlayRef = null;
    this._isOpen.set(false);
    this._focusSubject.next(false);
    this._onTouchedCallback();
    this._inputEl?.nativeElement?.focus();
    this._cdr.markForCheck();
  }

  /**
   * Avanza al mes anterior.
   */
  prevMonth(): void {
    const v: Date = this._viewDate();
    this._viewDate.set(new Date(v.getFullYear(), v.getMonth() - 1, 1));
    this._rebuildCalendar(this._viewDate());
    this._cdr.markForCheck();
  }

  /**
   * Avanza al mes siguiente.
   */
  nextMonth(): void {
    const v: Date = this._viewDate();
    this._viewDate.set(new Date(v.getFullYear(), v.getMonth() + 1, 1));
    this._rebuildCalendar(this._viewDate());
    this._cdr.markForCheck();
  }

  /**
   * Selecciona el día de hoy.
   */
  selectToday(): void {
    const today: Date = new Date();
    this._selectDay(today);
  }

  /**
   * Maneja el click en un día del grid.
   *
   * @param {RetroDatepickerDay} day - Día clickado.
   */
  onDayClick(day: RetroDatepickerDay): void {
    if (!day.date || day.isDisabled) return;
    this._selectDay(day.date);
  }

  /**
   * Maneja teclas dentro del dialog (Escape cierra).
   *
   * @param {KeyboardEvent} event - Evento de teclado.
   */
  onDialogKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      this.close();
    }
  }

  /**
   * Maneja teclas dentro de las celdas del grid.
   *
   * @param {KeyboardEvent} event - Evento de teclado.
   * @param {RetroDatepickerDay} day - Día activo.
   */
  onDayKeydown(event: KeyboardEvent, day: RetroDatepickerDay): void {
    if (!day.date) return;
    const key: string = event.key;
    let newDate: Date | null = null;

    if (key === 'ArrowLeft') {
      event.preventDefault();
      newDate = this._addDays(day.date, -1);
    } else if (key === 'ArrowRight') {
      event.preventDefault();
      newDate = this._addDays(day.date, 1);
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      newDate = this._addDays(day.date, -7);
    } else if (key === 'ArrowDown') {
      event.preventDefault();
      newDate = this._addDays(day.date, 7);
    } else if (key === 'Home') {
      event.preventDefault();
      newDate = this._startOfWeek(day.date);
    } else if (key === 'End') {
      event.preventDefault();
      newDate = this._endOfWeek(day.date);
    } else if (key === 'PageUp') {
      event.preventDefault();
      newDate = event.shiftKey ? this._addYears(day.date, -1) : this._addMonths(day.date, -1);
    } else if (key === 'PageDown') {
      event.preventDefault();
      newDate = event.shiftKey ? this._addYears(day.date, 1) : this._addMonths(day.date, 1);
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      this._selectDay(day.date);
      return;
    }

    if (newDate) {
      this._navigateToDate(newDate);
    }
  }

  /**
   * Maneja el evento focus del input para notificar al form-field.
   */
  onInputFocus(): void {
    this._focusSubject.next(true);
  }

  /**
   * Maneja el evento blur del input.
   */
  onInputBlur(): void {
    if (!this._isOpen()) {
      this._focusSubject.next(false);
      this._onTouchedCallback();
    }
  }

  /**
   * Limpia la fecha y emite el output cleared.
   */
  onClear(): void {
    this._selectedDate.set(null);
    this._displayText.set('');
    this._onChangeCallback(null);
    this._onTouchedCallback();
    this.cleared.emit();
    this._rebuildCalendar(this._viewDate());
    this._cdr.markForCheck();
  }

  /**
   * Compara si dos fechas son el mismo día.
   *
   * @param {Date} a - Primera fecha.
   * @param {Date} b - Segunda fecha.
   */
  isSameDay(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  // ── Métodos privados ─────────────────────────────────────────────────────────

  /**
   * Abre el panel de calendario anclado al ElementRef del host.
   */
  private _openPanel(): void {
    if (this._isOpen() || !this._calendarTemplate) return;

    this._rebuildCalendar(this._viewDate());

    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this._elRef)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }
      ])
      .withPush(true);

    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition()
    });

    this._overlayRef
      .backdropClick()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => this.close());
    this._overlayRef
      .keydownEvents()
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe((e: KeyboardEvent) => {
        if (e.key === 'Escape') this.close();
      });

    const portal: TemplatePortal = new TemplatePortal(this._calendarTemplate, this._viewContainerRef);
    this._overlayRef.attach(portal);
    this._isOpen.set(true);
    this._focusSubject.next(true);
    this._cdr.markForCheck();
  }

  /**
   * Selecciona un día, actualiza el FormControl y cierra el calendario.
   *
   * @param {Date} date - Fecha seleccionada.
   */
  private _selectDay(date: Date): void {
    const selected: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this._selectedDate.set(selected);
    this._displayText.set(this._formatDate(selected));
    this._onChangeCallback(selected);
    this._onTouchedCallback();
    this.close();
  }

  /**
   * Navega a una fecha (cambia el mes si es necesario) y activa esa celda.
   *
   * @param {Date} date - Fecha a la que navegar.
   */
  private _navigateToDate(date: Date): void {
    const viewDate: Date = this._viewDate();
    if (date.getMonth() !== viewDate.getMonth() || date.getFullYear() !== viewDate.getFullYear()) {
      this._viewDate.set(new Date(date.getFullYear(), date.getMonth(), 1));
      this._rebuildCalendar(this._viewDate());
    }
    this._activeDate.set(date);
    this._cdr.markForCheck();

    // Enfocar la celda activa dentro del overlay del datepicker.
    Promise.resolve().then(() => {
      const root: HTMLElement | undefined = this._overlayRef?.overlayElement;
      const el: HTMLElement | null | undefined = root?.querySelector<HTMLElement>('[role="gridcell"][tabindex="0"]');
      el?.focus();
    });
  }

  /**
   * Reconstruye la matriz de semanas para el mes visible.
   *
   * @param {Date} viewDate - Primer día del mes visible.
   */
  private _rebuildCalendar(viewDate: Date): void {
    const today: Date = new Date();
    const year: number = viewDate.getFullYear();
    const month: number = viewDate.getMonth();

    // Header label en es-ES: "mayo 2026"
    this.headerLabel.set(new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(viewDate));

    // Primer día del mes (0=domingo..6=sábado) → ajustar a lunes primero
    const firstDay: Date = new Date(year, month, 1);
    let startOffset: number = firstDay.getDay() - 1; // 0=lunes..6=domingo
    if (startOffset < 0) startOffset = 6;

    // Último día del mes
    const daysInMonth: number = new Date(year, month + 1, 0).getDate();

    const days: RetroDatepickerDay[] = [];

    // Días del mes anterior
    for (let i: number = startOffset - 1; i >= 0; i--) {
      const d: Date = new Date(year, month, -i);
      days.push(this._buildDay(d, false, today));
    }

    // Días del mes actual
    for (let i: number = 1; i <= daysInMonth; i++) {
      const d: Date = new Date(year, month, i);
      days.push(this._buildDay(d, true, today));
    }

    // Días del mes siguiente (completar la última semana)
    while (days.length % 7 !== 0) {
      const d: Date = new Date(year, month + 1, days.length - daysInMonth - startOffset + 1);
      days.push(this._buildDay(d, false, today));
    }

    // Agrupar en semanas de 7
    const weekGroups: RetroDatepickerDay[][] = [];
    for (let i: number = 0; i < days.length; i += 7) {
      weekGroups.push(days.slice(i, i + 7));
    }

    this.weeks.set(weekGroups);

    // Si no hay fecha activa, activar el día seleccionado o el primer día del mes.
    if (!this._activeDate()) {
      this._activeDate.set(this._selectedDate() || new Date(year, month, 1));
    }
  }

  /**
   * Construye un objeto RetroDatepickerDay para una fecha dada.
   *
   * @param {Date} date - La fecha.
   * @param {boolean} inMonth - Si pertenece al mes visible.
   * @param {Date} today - Fecha de hoy.
   */
  private _buildDay(date: Date, inMonth: boolean, today: Date): RetroDatepickerDay {
    const isToday: boolean = this.isSameDay(date, today);
    const isSelected: boolean = !!this._selectedDate() && this.isSameDay(date, this._selectedDate()!);
    const isDisabled: boolean = this._isOutOfRange(date);

    return {
      date,
      inMonth,
      isToday,
      isSelected,
      isDisabled,
      label: String(date.getDate())
    };
  }

  /**
   * Verifica si una fecha está fuera del rango min/max.
   *
   * @param {Date} date - Fecha a verificar.
   */
  private _isOutOfRange(date: Date): boolean {
    const min: Date | null = this.min();
    const max: Date | null = this.max();
    if (min && date < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return true;
    if (max && date > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return true;
    return false;
  }

  /**
   * Formatea una fecha como dd/MM/yyyy para el input visible.
   *
   * @param {Date} date - Fecha a formatear.
   */
  private _formatDate(date: Date): string {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
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
   * Devuelve una nueva fecha N días más tarde.
   *
   * @param {Date} date - Fecha base.
   * @param {number} days - Número de días a añadir (puede ser negativo).
   */
  private _addDays(date: Date, days: number): Date {
    const result: Date = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Devuelve una nueva fecha N meses más tarde.
   *
   * @param {Date} date - Fecha base.
   * @param {number} months - Número de meses a añadir.
   */
  private _addMonths(date: Date, months: number): Date {
    const result: Date = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  /**
   * Devuelve una nueva fecha N años más tarde.
   *
   * @param {Date} date - Fecha base.
   * @param {number} years - Número de años a añadir.
   */
  private _addYears(date: Date, years: number): Date {
    const result: Date = new Date(date);
    result.setFullYear(result.getFullYear() + years);
    return result;
  }

  /**
   * Devuelve el primer día de la semana (lunes) de la semana que contiene date.
   *
   * @param {Date} date - Fecha de referencia.
   */
  private _startOfWeek(date: Date): Date {
    const result: Date = new Date(date);
    let day: number = result.getDay() - 1; // Ajuste: lunes=0
    if (day < 0) day = 6;
    result.setDate(result.getDate() - day);
    return result;
  }

  /**
   * Devuelve el último día de la semana (domingo) de la semana que contiene date.
   *
   * @param {Date} date - Fecha de referencia.
   */
  private _endOfWeek(date: Date): Date {
    return this._addDays(this._startOfWeek(date), 6);
  }

  /**
   * Callback CVA onChange — notifica al formulario del nuevo valor.
   *
   * @param {Date | null} _v - Nuevo valor.
   */
  private _onChangeCallback(_v: Date | null): void {}

  /**
   * Callback CVA onTouched — marca el control como tocado.
   */
  private _onTouchedCallback(): void {}
}
