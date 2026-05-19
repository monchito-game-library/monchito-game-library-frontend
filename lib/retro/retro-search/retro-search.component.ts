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
  OnDestroy,
  OnInit,
  output,
  OutputEmitterRef,
  QueryList,
  signal,
  TemplateRef,
  ViewChild,
  ViewContainerRef,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, NgControl, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal, PortalModule } from '@angular/cdk/portal';
import { Subject, Observable, startWith } from 'rxjs';
import { RetroFormFieldComponent } from '../retro-form-field/retro-form-field.component';
import { RetroInputDirective } from '../retro-form-field/components/retro-input/retro-input.directive';
import { RetroLabelComponent } from '../retro-form-field/components/retro-label/retro-label.component';
import { RetroErrorComponent } from '../retro-form-field/components/retro-error/retro-error.component';
import { RetroHintComponent } from '../retro-form-field/components/retro-hint/retro-hint.component';
import { RetroIconComponent } from '../retro-icon/retro-icon.component';
import { RetroOptionComponent } from '../retro-select/components/retro-option/retro-option.component';
import { RETRO_OPTION_PARENT, RetroOptionParent } from '../retro-select/tokens/retro-option-parent.token';
import {
  RETRO_FORM_FIELD_CONTROL,
  RetroFormFieldControl
} from '../retro-form-field/tokens/retro-form-field-control.token';

let _nextSearchId: number = 0;

/**
 * Campo de búsqueda con autocomplete self-contained Terminal Collector.
 * Internaliza retro-form-field + input nativo + panel overlay.
 * El consumidor proyecta <retro-option> y el componente gestiona la apertura del panel.
 *
 * La lógica de filtrado vive en el componente padre (computed signal o pipe).
 * El componente emite queryChange cada vez que el usuario escribe.
 *
 * Estados internos separados:
 * - _displayValue: texto visible en el input (controlado por el usuario).
 * - _selectedValue: valor real del FormControl (solo cambia al seleccionar).
 *
 * Uso:
 * ```html
 * <retro-search
 *   label="Plataforma"
 *   formControlName="platform"
 *   [displayWith]="displayPlatformLabel"
 *   (queryChange)="filterPlatforms($event)">
 *   @for (p of filteredPlatforms(); track p.code) {
 *     <retro-option [value]="p.code">{{ p.labelKey | transloco }}</retro-option>
 *   }
 * </retro-search>
 * ```
 */
@Component({
  selector: 'retro-search',
  standalone: true,
  imports: [
    PortalModule,
    RetroFormFieldComponent,
    RetroInputDirective,
    RetroLabelComponent,
    RetroErrorComponent,
    RetroHintComponent,
    RetroIconComponent
  ],
  templateUrl: './retro-search.component.html',
  styleUrl: './retro-search.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => RetroSearchComponent), multi: true },
    { provide: RETRO_OPTION_PARENT, useExisting: forwardRef(() => RetroSearchComponent) },
    { provide: RETRO_FORM_FIELD_CONTROL, useExisting: forwardRef(() => RetroSearchComponent) }
  ]
})
export class RetroSearchComponent
  implements ControlValueAccessor, RetroFormFieldControl, RetroOptionParent, AfterContentInit, OnInit, OnDestroy
{
  // ── Inyecciones privadas ─────────────────────────────────────────────────────

  private readonly _overlay: Overlay = inject(Overlay);
  private readonly _viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);
  private readonly _elRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _injector: Injector = inject(Injector);
  private readonly _focusSubject: Subject<boolean> = new Subject<boolean>();

  /** Opciones proyectadas por el consumidor. */
  @ContentChildren(RetroOptionComponent, { descendants: true })
  private readonly _options!: QueryList<RetroOptionComponent>;

  /** Input nativo interno. */
  @ViewChild('inputEl')
  private readonly _inputEl!: ElementRef<HTMLInputElement>;

  /** Template del panel de opciones. */
  @ViewChild('panel')
  private readonly _panelTemplate!: TemplateRef<unknown>;

  // ── Variables privadas ───────────────────────────────────────────────────────

  private _overlayRef: OverlayRef | null = null;
  private _activeIndex: number = -1;

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

  /** Verdadero cuando no hay valor seleccionado ni texto en el input. */
  get empty(): boolean {
    return this._selectedValue() === null && this._displayValue() === '';
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

  /** Icono decorativo en el prefix. Por defecto muestra la lupa para indicar que es un campo de búsqueda. */
  readonly prefixIcon: InputSignal<string | null> = input<string | null>('search');

  /** Icono decorativo en el suffix. */
  readonly suffixIcon: InputSignal<string | null> = input<string | null>(null);

  /** Muestra el botón de limpiar cuando hay valor o texto. */
  readonly clearable: InputSignal<boolean> = input<boolean>(false);

  /** Texto del aria-label del botón limpiar. */
  readonly clearAriaLabel: InputSignal<string> = input<string>('Limpiar');

  /**
   * Función para convertir el valor seleccionado en el texto visible del input.
   * Ej.: `(id) => platformsMap.get(id)?.label ?? ''`
   */
  readonly displayWith: InputSignal<((value: any) => string) | null> = input<((value: any) => string) | null>(null);

  /**
   * Número mínimo de caracteres para abrir el panel.
   * Con 0 (default), el panel se abre al hacer focus.
   */
  readonly minChars: InputSignal<number> = input<number>(0);

  // ── Signals públicos ─────────────────────────────────────────────────────────

  /** Verdadero cuando el control está deshabilitado. */
  readonly _isDisabled: WritableSignal<boolean> = signal<boolean>(false);

  /** Texto visible en el input (lo que el usuario escribe). */
  readonly _displayValue: WritableSignal<string> = signal<string>('');

  /** Valor real del FormControl (solo cambia al seleccionar). */
  readonly _selectedValue: WritableSignal<unknown> = signal<unknown>(null);

  /** Verdadero cuando el panel de opciones está abierto (para aria-expanded). */
  readonly _panelOpen: WritableSignal<boolean> = signal<boolean>(false);

  // ── Outputs públicos ─────────────────────────────────────────────────────────

  /** Emite el texto actual cada vez que el usuario escribe. El padre filtra las opciones. */
  readonly queryChange: OutputEmitterRef<string> = output<string>();

  /** Emite el valor de la opción seleccionada. */
  readonly optionSelected: OutputEmitterRef<unknown> = output<unknown>();

  /** Emite cuando el usuario pulsa el botón limpiar. */
  readonly cleared: OutputEmitterRef<void> = output<void>();

  // ── IDs ──────────────────────────────────────────────────────────────────────

  /** ID del listbox (para aria-controls). */
  readonly listboxId: string = `retro-search-listbox-${++_nextSearchId}`;

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

  ngAfterContentInit(): void {
    // Reaccionar cuando las opciones proyectadas cambian.
    this._options.changes.pipe(startWith(null), takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      this._cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this._overlayRef?.dispose();
  }

  // ── Métodos públicos (CVA) ───────────────────────────────────────────────────

  /** @inheritdoc */
  writeValue(value: unknown): void {
    this._selectedValue.set(value ?? null);
    // Sincronizar el texto visible con displayWith si existe.
    if (value !== null && value !== undefined) {
      const displayFn = this.displayWith();
      this._displayValue.set(displayFn ? displayFn(value) : String(value));
    } else {
      this._displayValue.set('');
    }
    this._cdr.markForCheck();
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

  // ── Métodos públicos (handlers de template) ──────────────────────────────────

  /**
   * Abre el panel al hacer focus en el input.
   * Re-emite queryChange para que el padre actualice las opciones filtradas
   * antes de abrir el panel (p.ej. al recuperar foco tras seleccionar).
   */
  onFocus(): void {
    this._focusSubject.next(true);
    if (this._displayValue().length >= this.minChars()) {
      this.queryChange.emit(this._displayValue());
      this._openPanel();
    }
  }

  /**
   * Cierra el panel al perder el foco (si el foco no va al panel).
   * El timeout de 150ms permite que el click en una opción del overlay
   * se procese antes de cerrar, evitando perder la selección.
   */
  onBlur(): void {
    setTimeout(() => {
      if (this._overlayRef) return;
      this._focusSubject.next(false);
      this._onTouchedCallback();
    }, 150);
  }

  /**
   * Abre el panel al escribir y emite queryChange.
   *
   * @param {Event} event - Evento input del input nativo.
   */
  onInput(event: Event): void {
    const value: string = (event.target as HTMLInputElement).value;
    this._displayValue.set(value);
    this.queryChange.emit(value);

    if (value.length >= this.minChars()) {
      this._openPanel();
    } else {
      this._closePanel();
    }
    this._cdr.markForCheck();
  }

  /**
   * Gestiona la navegación de teclado.
   *
   * @param {KeyboardEvent} event - Evento keydown del input.
   */
  onKeydown(event: KeyboardEvent): void {
    const key: string = event.key;

    if (key === 'ArrowDown') {
      event.preventDefault();
      if (!this._isOpen()) {
        this._openPanel();
      } else {
        this._moveActive(1);
      }
    } else if (key === 'ArrowUp') {
      event.preventDefault();
      this._moveActive(-1);
    } else if (key === 'Enter') {
      if (this._isOpen()) {
        event.preventDefault();
        this._selectActive();
      }
    } else if (key === 'Escape') {
      if (this._isOpen()) {
        event.preventDefault();
        this._closePanel();
      }
    }
  }

  /**
   * Implementación de RetroOptionParent.selectOption —
   * llamado por RetroOptionComponent cuando el usuario hace click.
   *
   * @param {RetroOptionComponent} option - Opción seleccionada.
   */
  selectOption(option: RetroOptionComponent): void {
    this._emitSelected(option);
  }

  /**
   * Limpia la selección y el texto del input, emite el output cleared.
   */
  onClear(): void {
    this._displayValue.set('');
    this._selectedValue.set(null);
    this._onChangeCallback(null);
    this._onTouchedCallback();
    this.cleared.emit();
    this._closePanel();
    this._inputEl?.nativeElement?.focus();
    this._cdr.markForCheck();
  }

  // ── Métodos privados ─────────────────────────────────────────────────────────

  /**
   * Devuelve si el panel está abierto actualmente.
   */
  private _isOpen(): boolean {
    return !!this._overlayRef;
  }

  /**
   * Abre el panel overlay anclado al ElementRef del host.
   */
  private _openPanel(): void {
    if (this._isOpen() || !this._panelTemplate) return;

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
    this._panelOpen.set(true);
    this._cdr.markForCheck();
  }

  /**
   * Cierra el panel overlay sin emitir selección.
   */
  private _closePanel(): void {
    this._overlayRef?.detach();
    this._overlayRef?.dispose();
    this._overlayRef = null;
    this._activeIndex = -1;
    this._clearActive();
    this._panelOpen.set(false);
    this._cdr.markForCheck();
  }

  /**
   * Mueve el highlight de teclado.
   *
   * @param {1 | -1} direction - Dirección del movimiento.
   */
  private _moveActive(direction: 1 | -1): void {
    if (!this._isOpen()) {
      this._openPanel();
      return;
    }
    const optArr: RetroOptionComponent[] = this._options.toArray();
    let idx: number = this._activeIndex + direction;
    while (idx >= 0 && idx < optArr.length && optArr[idx].isDisabled()) {
      idx += direction;
    }
    if (idx >= 0 && idx < optArr.length) {
      this._setActiveIndex(idx);
    }
  }

  /**
   * Establece el índice activo y actualiza el highlight visual.
   *
   * @param {number} idx - Índice de la opción a activar.
   */
  private _setActiveIndex(idx: number): void {
    const optArr: RetroOptionComponent[] = this._options.toArray();
    this._clearActive();
    this._activeIndex = idx;
    if (idx >= 0 && idx < optArr.length) {
      optArr[idx].setActive(true);
    }
    this._cdr.markForCheck();
  }

  /**
   * Quita el highlight de todas las opciones.
   */
  private _clearActive(): void {
    this._options?.forEach((opt) => opt.setActive(false));
  }

  /**
   * Selecciona la opción activa actualmente si hay alguna.
   */
  private _selectActive(): void {
    const optArr: RetroOptionComponent[] = this._options.toArray();
    const active: RetroOptionComponent | undefined = optArr[this._activeIndex];
    if (active && !active.isDisabled()) {
      this._emitSelected(active);
    }
  }

  /**
   * Emite la selección, actualiza el estado interno y cierra el panel.
   *
   * @param {RetroOptionComponent} option - Opción seleccionada.
   */
  private _emitSelected(option: RetroOptionComponent): void {
    const value: unknown = option.value();
    this._selectedValue.set(value);
    const displayFn = this.displayWith();
    this._displayValue.set(displayFn ? displayFn(value) : option.getLabel());
    this._onChangeCallback(value);
    this._onTouchedCallback();
    this.optionSelected.emit(value);
    this._closePanel();
    this._cdr.markForCheck();
  }

  /**
   * Callback CVA onChange — notifica al formulario del nuevo valor.
   *
   * @param {unknown} _v - Nuevo valor.
   */
  private _onChangeCallback(_v: unknown): void {}

  /**
   * Callback CVA onTouched — marca el control como tocado.
   */
  private _onTouchedCallback(): void {}
}
