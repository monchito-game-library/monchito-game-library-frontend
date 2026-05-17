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
  input,
  InputSignal,
  OnChanges,
  OnDestroy,
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
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal, PortalModule } from '@angular/cdk/portal';
import { LibOptionComponent } from './lib-option.component';
import { LIB_OPTION_PARENT, LibOptionParent } from './lib-option-parent.token';
import { LibIconComponent } from '@/lib/lib-icon/lib-icon.component';
import { merge, startWith } from 'rxjs';

let _nextSelectId: number = 0;

/**
 * Select accesible Terminal Collector (combobox + listbox pattern, APG).
 * Implementa ControlValueAccessor para funcionar con formControlName / ngModel.
 *
 * Patrón ARIA:
 * - Trigger: role="combobox", aria-expanded, aria-haspopup="listbox",
 *   aria-controls="<listboxId>", aria-activedescendant cuando hay highlight.
 * - Listbox: role="listbox", aria-labelledby apuntando a la label.
 * - Opciones: role="option", aria-selected (via LibOptionComponent).
 *
 * Uso:
 * ```html
 * <app-lib-form-field>
 *   <app-lib-label>Estado</app-lib-label>
 *   <app-lib-select formControlName="status">
 *     @for (s of statuses; track s.code) {
 *       <app-lib-option [value]="s.code">{{ s.label }}</app-lib-option>
 *     }
 *   </app-lib-select>
 * </app-lib-form-field>
 * ```
 */
@Component({
  selector: 'app-lib-select',
  standalone: true,
  imports: [PortalModule, LibIconComponent],
  templateUrl: './lib-select.component.html',
  styleUrl: './lib-select.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => LibSelectComponent), multi: true },
    { provide: LIB_OPTION_PARENT, useExisting: forwardRef(() => LibSelectComponent) }
  ],
  host: {
    class: 'lib-select'
  }
})
export class LibSelectComponent
  implements ControlValueAccessor, LibOptionParent, AfterContentInit, OnChanges, OnDestroy
{
  // ── Inyecciones privadas ─────────────────────────────────────────────────────

  private readonly _overlay: Overlay = inject(Overlay);
  private readonly _viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);

  // ── Variables privadas ───────────────────────────────────────────────────────

  private _overlayRef: OverlayRef | null = null;
  private _activeIndex: number = -1;

  /** Opciones proyectadas. */
  @ContentChildren(LibOptionComponent, { descendants: true })
  private _options!: QueryList<LibOptionComponent>;

  /** Botón trigger del combobox. */
  @ViewChild('trigger')
  private _triggerEl!: ElementRef<HTMLButtonElement>;

  /** Template del panel de opciones. */
  @ViewChild('panel')
  private _panelTemplate!: TemplateRef<unknown>;

  // ── Inputs / Outputs públicos ────────────────────────────────────────────────

  /** Texto de placeholder cuando no hay selección. */
  readonly placeholder: InputSignal<string> = input<string>('');

  /** ID del elemento label externo (para aria-labelledby). */
  readonly ariaLabelledBy: InputSignal<string | undefined> = input<string | undefined>(undefined);

  /**
   * Valor de selección en modo standalone (sin formControlName).
   * Equivalente a [value] de mat-select.
   */
  readonly value: InputSignal<unknown> = input<unknown>(undefined);

  /**
   * Emite el nuevo valor cuando el usuario selecciona una opción.
   * Equivalente a (selectionChange) de mat-select.
   */
  readonly selectionChange: OutputEmitterRef<unknown> = output<unknown>();

  // ── ID único ─────────────────────────────────────────────────────────────────

  /** ID único de este select (para aria-controls). */
  readonly listboxId: string = `lib-select-listbox-${++_nextSelectId}`;

  // ── Signals públicos ─────────────────────────────────────────────────────────

  /** Verdadero cuando el panel está abierto. */
  readonly open: WritableSignal<boolean> = signal(false);

  /** Valor actualmente seleccionado (tipo opaco). */
  readonly _value: WritableSignal<unknown> = signal(undefined);

  /** Deshabilita el control. */
  readonly _isDisabled: WritableSignal<boolean> = signal(false);

  /** ID de la opción activa (para aria-activedescendant). */
  readonly _activeOptionId: WritableSignal<string | null> = signal(null);

  // ── Lifecycle ────────────────────────────────────────────────────────────────

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

  /**
   * Devuelve el label de la opción actualmente seleccionada,
   * o el placeholder si no hay selección.
   */
  displayValue(): string {
    if (this._value() === undefined || this._value() === null) return this.placeholder();
    const selected: LibOptionComponent | undefined = this._options?.find((opt) => opt.value() === this._value());
    return selected ? selected.getLabel() : String(this._value());
  }

  /**
   * Abre o cierra el panel de selección.
   */
  toggle(): void {
    if (this._isDisabled()) return;
    this.open() ? this._closePanel() : this._openPanel();
  }

  /**
   * Maneja las teclas del trigger (cerrado o abierto).
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
      const optArr: LibOptionComponent[] = this._options.toArray();
      const active: LibOptionComponent | undefined = optArr[this._activeIndex];
      if (active && !active.isDisabled()) {
        this._selectOption(active);
      }
    } else if (key === 'Tab') {
      const optArr: LibOptionComponent[] = this._options.toArray();
      const active: LibOptionComponent | undefined = optArr[this._activeIndex];
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
   * Implementación de LibOptionParent.selectOption —
   * llamado por LibOptionComponent cuando el usuario hace click.
   *
   * @param {LibOptionComponent} option - Opción seleccionada.
   */
  selectOption(option: LibOptionComponent): void {
    this._selectOption(option);
  }

  // ── Métodos privados ─────────────────────────────────────────────────────────

  /**
   * Mueve el índice activo +1 o -1, saltando opciones desactivadas.
   *
   * @param {1 | -1} direction - Dirección del movimiento.
   */
  private _moveActive(direction: 1 | -1): void {
    const optArr: LibOptionComponent[] = this._options.toArray();
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
    const optArr: LibOptionComponent[] = this._options.toArray();
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
   * Abre el panel overlay anclado al trigger.
   */
  private _openPanel(): void {
    if (this.open() || !this._panelTemplate) return;

    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(this._triggerEl)
      .withPositions([
        { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
        { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' }
      ])
      .withPush(true);

    this._overlayRef = this._overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      minWidth: this._triggerEl.nativeElement.offsetWidth
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
   * Cierra el panel overlay y restaura el foco al trigger.
   */
  private _closePanel(): void {
    this._overlayRef?.detach();
    this._overlayRef?.dispose();
    this._overlayRef = null;
    this._activeIndex = -1;
    this._activeOptionId.set(null);
    this.open.set(false);
    this._onTouchedCallback();
    this._triggerEl?.nativeElement?.focus();
    this._cdr.markForCheck();
  }

  /**
   * Selecciona una opción, actualiza el valor y cierra el panel.
   *
   * @param {LibOptionComponent} option - Opción a seleccionar.
   */
  private _selectOption(option: LibOptionComponent): void {
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
