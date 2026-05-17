import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  InputSignal,
  OnDestroy,
  output,
  OutputEmitterRef,
  signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal, PortalModule } from '@angular/cdk/portal';
import { TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { RetroIconButtonComponent } from '@/retro/retro-icon-button/retro-icon-button.component';
import { RETRO_DATEPICKER_DAY_HEADERS } from '@/constants/retro-datepicker-day-headers.constant';
import { RetroDatepickerDay } from '@/interfaces/retro-datepicker-day.interface';

let _nextDatepickerId: number = 0;

/**
 * Datepicker Terminal Collector. Vista mes con grid accesible.
 * Se conecta con la directiva [retroDatepicker] aplicada a un input nativo.
 *
 * Patrón ARIA: APG Date Picker Dialog Grid Pattern.
 * - Dialog: role="dialog", aria-modal="true", aria-labelledby (mes + año).
 * - Grid: role="grid".
 * - Filas: role="row".
 * - Celdas: role="gridcell".
 * - Día actual: aria-current="date".
 * - Día seleccionado: aria-selected="true".
 *
 * Uso:
 * ```html
 * <input retroInput [retroDatepicker]="picker" formControlName="purchaseDate" [readonly]="true" />
 * <retro-icon retroSuffix [retroDatepickerToggle]="picker" name="calendar_today" />
 * <retro-datepicker #picker [min]="minDate" [max]="maxDate" />
 * ```
 */
@Component({
  selector: 'retro-datepicker',
  standalone: true,
  imports: [PortalModule, RetroIconButtonComponent],
  template: `
    <ng-template #calendar>
      <div
        class="retro-datepicker__dialog"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="headerId"
        (keydown)="onDialogKeydown($event)">
        <!-- Header -->
        <div class="retro-datepicker__header">
          <retro-icon-button icon="chevron_left" [ariaLabel]="'Mes anterior'" (clicked)="prevMonth()" />
          <span class="retro-datepicker__header-label" [id]="headerId">
            {{ headerLabel() }}
          </span>
          <retro-icon-button icon="chevron_right" [ariaLabel]="'Mes siguiente'" (clicked)="nextMonth()" />
        </div>

        <!-- Day-of-week headers -->
        <div class="retro-datepicker__grid-header">
          @for (d of dayHeaders; track d) {
            <span class="retro-datepicker__weekday" aria-hidden="true">{{ d }}</span>
          }
        </div>

        <!-- Calendar grid -->
        <table class="retro-datepicker__grid" role="grid" [attr.aria-labelledby]="headerId">
          <tbody>
            @for (week of weeks(); track $index) {
              <tr role="row">
                @for (day of week; track day.date?.toISOString()) {
                  <td
                    role="gridcell"
                    [class.retro-datepicker__day--outside]="!day.inMonth"
                    [class.retro-datepicker__day--today]="day.isToday"
                    [class.retro-datepicker__day--selected]="day.isSelected"
                    [class.retro-datepicker__day--active]="
                      day.date && _activeDate() && isSameDay(day.date, _activeDate()!)
                    "
                    [class.retro-datepicker__day--disabled]="day.isDisabled"
                    [attr.aria-selected]="day.isSelected ? true : null"
                    [attr.aria-current]="day.isToday ? 'date' : null"
                    [attr.aria-disabled]="day.isDisabled ? true : null"
                    [attr.tabindex]="day.date && _activeDate() && isSameDay(day.date, _activeDate()!) ? 0 : -1"
                    (click)="onDayClick(day)"
                    (keydown)="onDayKeydown($event, day)">
                    <span class="retro-datepicker__day-label">{{ day.label }}</span>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>

        <!-- Today button -->
        <div class="retro-datepicker__footer">
          <button type="button" class="retro-datepicker__today-btn" (click)="selectToday()">Hoy</button>
          <button type="button" class="retro-datepicker__close-btn" (click)="close()">Cerrar</button>
        </div>
      </div>
    </ng-template>
  `,
  styleUrl: './retro-datepicker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroDatepickerComponent implements OnDestroy {
  private readonly _overlay: Overlay = inject(Overlay);
  private readonly _viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);

  private _overlayRef: OverlayRef | null = null;
  private _triggerRef: ElementRef<HTMLInputElement> | null = null;

  @ViewChild('calendar')
  private _calendarTemplate!: TemplateRef<unknown>;

  // ── Inputs / Outputs / Constantes públicos ───────────────────────────────────

  /** Constante de cabeceras de días. */
  readonly dayHeaders: string[] = RETRO_DATEPICKER_DAY_HEADERS;

  // ── Inputs ───────────────────────────────────────────────────────────────────

  /** Fecha mínima seleccionable. */
  readonly min: InputSignal<Date | null> = input<Date | null>(null);

  /** Fecha máxima seleccionable. */
  readonly max: InputSignal<Date | null> = input<Date | null>(null);

  // ── Outputs ──────────────────────────────────────────────────────────────────

  /** Emite la fecha seleccionada cuando el usuario elige un día. */
  readonly dateSelected: OutputEmitterRef<Date | null> = output<Date | null>();

  // ── IDs ──────────────────────────────────────────────────────────────────────

  readonly headerId: string = `retro-datepicker-header-${++_nextDatepickerId}`;

  // ── Signals internos ─────────────────────────────────────────────────────────

  /** Mes/año visible actualmente en el calendario. */
  readonly _viewDate: WritableSignal<Date> = signal(new Date());

  /** Fecha actualmente seleccionada. */
  readonly _selectedDate: WritableSignal<Date | null> = signal(null);

  /** Fecha activa en el grid (la que tiene tabindex=0). */
  readonly _activeDate: WritableSignal<Date | null> = signal(null);

  /** Semanas calculadas para el mes visible. */
  readonly weeks: WritableSignal<RetroDatepickerDay[][]> = signal([]);

  /** Label del header (mes año en es-ES). */
  readonly headerLabel: WritableSignal<string> = signal('');

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnDestroy(): void {
    this._overlayRef?.dispose();
  }

  // ── Métodos públicos ─────────────────────────────────────────────────────────

  /**
   * Registra el input trigger.
   * Llamado por RetroDatepickerDirective.
   *
   * @param {ElementRef<HTMLInputElement>} trigger - Referencia al input nativo.
   */
  registerTrigger(trigger: ElementRef<HTMLInputElement>): void {
    this._triggerRef = trigger;
  }

  /**
   * Devuelve si el calendario está abierto.
   */
  isOpen(): boolean {
    return !!this._overlayRef;
  }

  /**
   * Abre el calendario anclado al trigger.
   */
  open(): void {
    if (this.isOpen() || !this._triggerRef) return;

    this._rebuildCalendar(this._viewDate());

    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this._triggerRef)
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
    this._cdr.markForCheck();
  }

  /**
   * Cierra el calendario.
   */
  close(): void {
    this._overlayRef?.detach();
    this._overlayRef?.dispose();
    this._overlayRef = null;
    this._triggerRef?.nativeElement?.focus();
    this._cdr.markForCheck();
  }

  /**
   * Establece la fecha seleccionada desde fuera (formControl.writeValue).
   *
   * @param {Date | string | null} value - Fecha a establecer.
   */
  setDate(value: Date | string | null): void {
    if (!value) {
      this._selectedDate.set(null);
    } else {
      const d: Date = typeof value === 'string' ? new Date(value) : value;
      if (!isNaN(d.getTime())) {
        this._selectedDate.set(d);
        this._viewDate.set(new Date(d.getFullYear(), d.getMonth(), 1));
      }
    }
    this._rebuildCalendar(this._viewDate());
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
   * Selecciona un día, emite el output y cierra el calendario.
   *
   * @param {Date} date - Fecha seleccionada.
   */
  private _selectDay(date: Date): void {
    const selected: Date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    this._selectedDate.set(selected);
    this.dateSelected.emit(selected);
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

    // Enfocar la celda activa dentro del overlay del datepicker (no global).
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
    const weeks: RetroDatepickerDay[][] = [];
    for (let i: number = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }

    this.weeks.set(weeks);

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
}
