import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChildren,
  DestroyRef,
  ElementRef,
  forwardRef,
  inject,
  Injector,
  input,
  InputSignal,
  OnChanges,
  OnDestroy,
  OnInit,
  output,
  OutputEmitterRef,
  QueryList,
  signal,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal, PortalModule } from '@angular/cdk/portal';
import { Subject, Observable, merge, startWith } from 'rxjs';
import { RetroFormFieldComponent } from '../retro-form-field/retro-form-field.component';
import { RetroLabelComponent } from '../retro-form-field/components/retro-label/retro-label.component';
import { RetroErrorComponent } from '../retro-form-field/components/retro-error/retro-error.component';
import { RetroHintComponent } from '../retro-form-field/components/retro-hint/retro-hint.component';
import { RetroIconComponent } from '../retro-icon/retro-icon.component';
import { RetroOptionComponent } from './components/retro-option/retro-option.component';
import { RETRO_OPTION_PARENT, RetroOptionParent } from './tokens/retro-option-parent.token';
import {
  RETRO_FORM_FIELD_CONTROL,
  RetroFormFieldControl
} from '../retro-form-field/tokens/retro-form-field-control.token';

let _nextSelectId: number = 0;

/**
 * Select accesible Terminal Collector (combobox + listbox pattern, APG).
 * Componente self-contained: internaliza retro-form-field, label, error y hint.
 * El consumidor solo usa <retro-select label="..." formControlName="...">
 *
 * Implementa ControlValueAccessor para funcionar con formControlName / ngModel.
 * Implementa RetroFormFieldControl para comunicarse con el retro-form-field interno.
 *
 * Patrón ARIA:
 * - Trigger: div role="combobox", aria-expanded, aria-haspopup="listbox",
 *   aria-controls="<listboxId>", aria-activedescendant cuando hay highlight.
 * - Listbox: role="listbox".
 * - Opciones: role="option", aria-selected (via RetroOptionComponent).
 *
 * Uso:
 * ```html
 * <retro-select label="Estado" formControlName="status">
 *   @for (s of statuses; track s.code) {
 *     <retro-option [value]="s.code">{{ s.label }}</retro-option>
 *   }
 * </retro-select>
 * ```
 */
@Component({
  selector: 'retro-select',
  standalone: true,
  imports: [
    PortalModule,
    RetroFormFieldComponent,
    RetroLabelComponent,
    RetroErrorComponent,
    RetroHintComponent,
    RetroIconComponent
  ],
  templateUrl: './retro-select.component.html',
  styleUrl: './retro-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RetroSelectComponent), multi: true },
    { provide: RETRO_OPTION_PARENT, useExisting: forwardRef(() => RetroSelectComponent) },
    { provide: RETRO_FORM_FIELD_CONTROL, useExisting: forwardRef(() => RetroSelectComponent) }
  ],
  host: {
    class: 'retro-select'
  }
})
export class RetroSelectComponent
  implements
    ControlValueAccessor,
    RetroFormFieldControl,
    RetroOptionParent,
    AfterContentInit,
    OnChanges,
    OnInit,
    OnDestroy
{
  // ── Inyecciones privadas ─────────────────────────────────────────────────────

  private readonly _overlay: Overlay = inject(Overlay);
  private readonly _viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _elRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _injector: Injector = inject(Injector);
  private readonly _focusSubject: Subject<boolean> = new Subject<boolean>();

  /** Opciones proyectadas. */
  @ContentChildren(RetroOptionComponent, { descendants: true })
  private readonly _options!: QueryList<RetroOptionComponent>;

  /** Div trigger del combobox — solo para devolver foco al cerrar. */
  @ViewChild('trigger')
  private readonly _triggerEl!: ElementRef<HTMLDivElement>;

  /** Template del panel de opciones. */
  @ViewChild('panel')
  private readonly _panelTemplate!: TemplateRef<unknown>;

  // ── Variables privadas ───────────────────────────────────────────────────────

  private _overlayRef: OverlayRef | null = null;
  private _activeIndex: number = -1;

  // ── Variables públicas readonly (RetroFormFieldControl + inputs + outputs) ───

  // Nota: ngControl es public-field (no readonly), se declara al final de esta sección.

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

  /** Verdadero cuando no hay valor seleccionado. */
  get empty(): boolean {
    const v = this._value();
    return v === undefined || v === null;
  }

  // ── Inputs públicos ──────────────────────────────────────────────────────────

  /** Texto del label del campo. Vacío si el consumidor no ha migrado aún a la API self-contained. */
  readonly label: InputSignal<string> = input<string>('');

  /** Texto de placeholder cuando no hay selección. */
  readonly placeholder: InputSignal<string> = input<string>('');

  /** Mensaje de hint. Nulo si no hay. */
  readonly hint: InputSignal<string | null> = input<string | null>(null);

  /** Mensaje de error. Nulo si no hay. */
  readonly error: InputSignal<string | null> = input<string | null>(null);

  /** Tamaño del campo: sm (32px), md (40px), lg (44px). */
  readonly size: InputSignal<'sm' | 'md' | 'lg'> = input<'sm' | 'md' | 'lg'>('lg');

  /** Icono decorativo en el prefix. */
  readonly prefixIcon: InputSignal<string | null> = input<string | null>(null);

  /** Icono decorativo en el suffix. */
  readonly suffixIcon: InputSignal<string | null> = input<string | null>(null);

  /** Muestra el botón de limpiar cuando el campo tiene valor. */
  readonly clearable: InputSignal<boolean> = input<boolean>(false);

  /** Texto del aria-label del botón limpiar. */
  readonly clearAriaLabel: InputSignal<string> = input<string>('Limpiar');

  /** Oculta el bloque subscript (hint/error) del form-field interno. Útil en campos de búsqueda sin validación visible. */
  readonly hideSubscript: InputSignal<boolean> = input<boolean>(false);

  /**
   * Valor de selección en modo standalone (sin formControlName).
   * Equivalente a [value] de mat-select.
   */
  readonly value: InputSignal<unknown> = input<unknown>(undefined);

  // ── Outputs públicos ─────────────────────────────────────────────────────────

  /**
   * Emite el nuevo valor cuando el usuario selecciona una opción.
   * Equivalente a (selectionChange) de mat-select.
   */
  readonly selectionChange: OutputEmitterRef<unknown> = output<unknown>();

  /** Emite cuando el usuario pulsa el botón limpiar. */
  readonly cleared: OutputEmitterRef<void> = output<void>();

  // ── ID único ─────────────────────────────────────────────────────────────────

  /** ID único de este select (para aria-controls). */
  readonly listboxId: string = `retro-select-listbox-${++_nextSelectId}`;

  // ── Signals públicos ─────────────────────────────────────────────────────────

  /** Verdadero cuando el panel está abierto. */
  readonly open: WritableSignal<boolean> = signal<boolean>(false);

  /** Valor actualmente seleccionado (tipo opaco). */
  readonly _value: WritableSignal<unknown> = signal<unknown>(undefined);

  /** Deshabilita el control. */
  readonly _isDisabled: WritableSignal<boolean> = signal<boolean>(false);

  /** ID de la opción activa (para aria-activedescendant). */
  readonly _activeOptionId: WritableSignal<string | null> = signal<string | null>(null);

  // ── Variables públicas (no readonly) ─────────────────────────────────────────

  /**
   * NgControl del host — se obtiene en ngOnInit para evitar la dependencia circular
   * con NG_VALUE_ACCESSOR. Permite leer estado de validación.
   */
  ngControl: NgControl | null = null;

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngOnInit(): void {
    // Obtener NgControl aquí (no en el constructor) para evitar NG0200 (dependencia circular
    // con NG_VALUE_ACCESSOR). Angular resuelve los providers antes de NgInit.
    this.ngControl = this._injector.get(NgControl, null, { optional: true, self: true });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ('value' in changes) {
      const v: unknown = changes['value'].currentValue;
      if (v !== undefined) {
        this._value.set(v);
        Promise.resolve().then(() => {
          this._syncSelectedOption();
          this._cdr.markForCheck();
        });
      }
    }
  }

  ngAfterContentInit(): void {
    merge(this._options.changes, this._options.changes.pipe(startWith(null)))
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(() => {
        this._syncSelectedOption();
        this._cdr.markForCheck();
      });
  }

  ngOnDestroy(): void {
    this._overlayRef?.dispose();
  }

  // ── Métodos públicos (CVA) ───────────────────────────────────────────────────

  /** @inheritdoc */
  writeValue(value: unknown): void {
    this._value.set(value);
    // Diferir la sincronización para evitar NG0100 cuando writeValue se llama
    // durante el ciclo de detección de cambios del padre.
    Promise.resolve().then(() => {
      this._syncSelectedOption();
      this._cdr.markForCheck();
    });
  }

  /** @inheritdoc */
  registerOnChange(fn: (_v: unknown) => void): void {
    this._onChangeCallback = fn;
  }

  /** @inheritdoc */
  registerOnTouched(fn: () => void): void {
    this._onTouchedCallback = fn;
  }

  /** @inheritdoc */
  setDisabledState(d: boolean): void {
    this._isDisabled.set(d);
    this._cdr.markForCheck();
  }

  // ── Métodos públicos (template handlers) ─────────────────────────────────────

  /**
   * Devuelve el label de la opción actualmente seleccionada,
   * o el placeholder si no hay selección.
   */
  displayValue(): string {
    if (this._value() === undefined || this._value() === null) return this.placeholder();
    const selected: RetroOptionComponent | undefined = this._options?.find((opt) => opt.value() === this._value());
    return selected ? selected.getLabel() : String(this._value());
  }

  /**
   * Abre o cierra el panel de selección.
   * Bloqueado si el control está deshabilitado.
   */
  toggle(): void {
    if (this._isDisabled()) return;
    this.open() ? this._closePanel() : this._openPanel();
  }

  /**
   * Maneja el evento de foco en el trigger div.
   */
  onTriggerFocus(): void {
    this._focusSubject.next(true);
  }

  /**
   * Maneja el evento de blur en el trigger div.
   */
  onTriggerBlur(): void {
    if (!this.open()) {
      this._focusSubject.next(false);
      this._onTouchedCallback();
    }
  }

  /**
   * Maneja las teclas del trigger (cerrado o abierto).
   * Bloqueado si el control está deshabilitado.
   *
   * @param {KeyboardEvent} event - Evento de teclado.
   */
  onTriggerKeydown(event: KeyboardEvent): void {
    if (this._isDisabled()) return;
    const key: string = event.key;

    if (!this.open()) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(key)) {
        event.preventDefault();
        this._openPanel();
        if (key === 'ArrowDown') {
          this._moveActive(1);
        } else if (key === 'ArrowUp') {
          this._moveActive(-1);
        }
      }
      return;
    }

    if (key === 'Escape') {
      event.preventDefault();
      this._closePanel();
    } else if (key === 'Enter' || key === ' ') {
      event.preventDefault();
      const optArr: RetroOptionComponent[] = this._options.toArray();
      const active: RetroOptionComponent | undefined = optArr[this._activeIndex];
      if (active && !active.isDisabled()) {
        this._selectOption(active);
      }
    } else if (key === 'Tab') {
      const optArr: RetroOptionComponent[] = this._options.toArray();
      const active: RetroOptionComponent | undefined = optArr[this._activeIndex];
      if (active && !active.isDisabled()) {
        this._selectOption(active);
      }
      this._closePanel();
    } else if (key === 'Home') {
      event.preventDefault();
      this._setActiveIndex(0);
    } else if (key === 'End') {
      event.preventDefault();
      this._setActiveIndex(this._options.length - 1);
    } else if (key === 'ArrowDown') {
      event.preventDefault();
      this._moveActive(1);
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      this._moveActive(-1);
    }
  }

  /**
   * Implementación de RetroOptionParent.selectOption —
   * llamado por RetroOptionComponent cuando el usuario hace click.
   *
   * @param {RetroOptionComponent} option - Opción seleccionada.
   */
  selectOption(option: RetroOptionComponent): void {
    this._selectOption(option);
  }

  /**
   * Limpia la selección y emite el output cleared.
   */
  onClear(): void {
    this._value.set(null);
    this._syncSelectedOption();
    this._onChangeCallback(null);
    this._onTouchedCallback();
    this.cleared.emit();
    this._cdr.markForCheck();
  }

  // ── Métodos privados ─────────────────────────────────────────────────────────

  /**
   * Mueve el índice activo +1 o -1, saltando opciones desactivadas.
   *
   * @param {1 | -1} direction - Dirección del movimiento.
   */
  private _moveActive(direction: 1 | -1): void {
    const optArr: RetroOptionComponent[] = this._options.toArray();
    if (optArr.length === 0) return;
    let idx: number = this._activeIndex + direction;
    while (idx >= 0 && idx < optArr.length && optArr[idx].isDisabled()) {
      idx += direction;
    }
    if (idx >= 0 && idx < optArr.length) {
      this._setActiveIndex(idx);
    }
  }

  /**
   * Establece el índice activo y actualiza el highlight.
   *
   * @param {number} idx - Índice de la opción a activar.
   */
  private _setActiveIndex(idx: number): void {
    const optArr: RetroOptionComponent[] = this._options.toArray();
    optArr.forEach((opt) => opt.setActive(false));
    this._activeIndex = idx;
    if (idx >= 0 && idx < optArr.length) {
      optArr[idx].setActive(true);
      this._activeOptionId.set(optArr[idx].id);
    } else {
      this._activeOptionId.set(null);
    }
    this._cdr.markForCheck();
  }

  /**
   * Abre el panel overlay anclado al ElementRef del host del componente.
   */
  private _openPanel(): void {
    if (this.open() || !this._panelTemplate) return;

    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this._elRef)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }
      ])
      .withFlexibleDimensions(false)
      .withPush(false)
      .withGrowAfterOpen(false);

    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      width: this._elRef.nativeElement.offsetWidth
    });

    this._overlayRef.backdropClick().subscribe(() => this._closePanel());
    this._overlayRef.keydownEvents().subscribe((e: KeyboardEvent) => {
      if (e.key === 'Escape') this._closePanel();
    });

    const portal: TemplatePortal = new TemplatePortal(this._panelTemplate, this._viewContainerRef);
    this._overlayRef.attach(portal);

    this.open.set(true);
    this._cdr.markForCheck();

    const selectedIdx: number = this._options.toArray().findIndex((opt) => opt.value() === this._value());
    this._setActiveIndex(selectedIdx >= 0 ? selectedIdx : 0);
  }

  /**
   * Cierra el panel overlay y restaura el foco al trigger div.
   */
  private _closePanel(): void {
    this._overlayRef?.detach();
    this._overlayRef?.dispose();
    this._overlayRef = null;
    this._activeIndex = -1;
    this._activeOptionId.set(null);
    this.open.set(false);
    this._focusSubject.next(false);
    this._onTouchedCallback();
    this._triggerEl?.nativeElement?.focus();
    this._cdr.markForCheck();
  }

  /**
   * Selecciona una opción, actualiza el valor y cierra el panel.
   *
   * @param {RetroOptionComponent} option - Opción a seleccionar.
   */
  private _selectOption(option: RetroOptionComponent): void {
    const newValue: unknown = option.value();
    this._value.set(newValue);
    this._syncSelectedOption();
    this._onChangeCallback(newValue);
    this._onTouchedCallback();
    this.selectionChange.emit(newValue);
    this._closePanel();
    this._cdr.markForCheck();
  }

  /**
   * Sincroniza el estado aria-selected de todas las opciones según _value.
   */
  private _syncSelectedOption(): void {
    if (!this._options) return;
    this._options.forEach((opt) => {
      opt.setSelected(opt.value() === this._value());
    });
  }

  /**
   * Callback registrado por Angular Forms al conectar un control reactivo.
   * Notifica al formulario del nuevo valor tras cada selección.
   *
   * @param {unknown} _v - Nuevo valor.
   */
  private _onChangeCallback(_v: unknown): void {}

  /**
   * Callback registrado por Angular Forms para marcar el control como tocado.
   */
  private _onTouchedCallback(): void {}
}
