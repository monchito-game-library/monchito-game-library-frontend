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
  OnDestroy,
  output,
  OutputEmitterRef,
  QueryList
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { TemplatePortal, PortalModule } from '@angular/cdk/portal';
import { TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { LibOptionComponent } from '@/lib/lib-select/lib-option.component';
import { LIB_OPTION_PARENT, LibOptionParent } from '@/lib/lib-select/lib-option-parent.token';
import { startWith } from 'rxjs';

let _nextAutocompleteId: number = 0;

/**
 * Panel de autocomplete Terminal Collector.
 * Se combina con la directiva LibAutocompleteTriggerDirective ([libAutocompleteTrigger])
 * aplicada a un <input libInput> para abrir/cerrar el panel y gestionar la selección.
 *
 * La lógica de filtrado vive en el componente padre (computed signal o pipe).
 *
 * Uso:
 * ```html
 * <app-lib-form-field>
 *   <app-lib-label>Plataforma</app-lib-label>
 *   <input libInput type="text" [libAutocompleteTrigger]="auto" [formControl]="form.controls.platform" />
 *   <app-lib-autocomplete #auto [displayWith]="displayPlatformLabel">
 *     @for (p of filteredPlatforms(); track p.code) {
 *       <app-lib-option [value]="p.code">{{ p.labelKey | transloco }}</app-lib-option>
 *     }
 *   </app-lib-autocomplete>
 * </app-lib-form-field>
 * ```
 */
@Component({
  selector: 'app-lib-autocomplete',
  standalone: true,
  imports: [PortalModule],
  template: `
    <ng-template #panel>
      <ul class="lib-autocomplete__panel" [id]="listboxId" role="listbox">
        <ng-content />
      </ul>
    </ng-template>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [{ provide: LIB_OPTION_PARENT, useExisting: forwardRef(() => LibAutocompleteComponent) }]
})
export class LibAutocompleteComponent implements LibOptionParent, AfterContentInit, OnDestroy {
  private readonly _overlay: Overlay = inject(Overlay);
  private readonly _viewContainerRef: ViewContainerRef = inject(ViewContainerRef);
  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);

  private _overlayRef: OverlayRef | null = null;
  private _activeIndex: number = -1;
  private _triggerRef: ElementRef<HTMLInputElement> | null = null;

  // ── ContentChildren ──────────────────────────────────────────────────────────

  @ContentChildren(LibOptionComponent, { descendants: true })
  private _options!: QueryList<LibOptionComponent>;

  // ── Template refs ────────────────────────────────────────────────────────────

  @ViewChild('panel')
  readonly panelTemplate!: TemplateRef<unknown>;

  // ── Inputs / Outputs públicos ────────────────────────────────────────────────

  /**
   * Función para convertir el valor seleccionado en el texto del input.
   * Ej.: `(id) => platformsMap.get(id)?.label ?? ''`
   * Acepta funciones con cualquier tipo de argumento (compatible con mat-autocomplete).
   */
  readonly displayWith: InputSignal<((value: any) => string) | null> = input<((value: any) => string) | null>(null);

  /** ID del listbox (para aria-controls). */
  readonly listboxId: string = `lib-autocomplete-listbox-${++_nextAutocompleteId}`;

  /**
   * Emite el valor de la opción seleccionada.
   * El trigger actualiza el input y el formControl con este valor.
   */
  readonly optionSelected: OutputEmitterRef<unknown> = output<unknown>();

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngAfterContentInit(): void {
    // Sincronizar opciones cuando cambian.
    this._options.changes.pipe(startWith(null), takeUntilDestroyed(this._destroyRef)).subscribe(() => {
      this._cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    this._overlayRef?.dispose();
  }

  // ── Métodos públicos ─────────────────────────────────────────────────────────

  /**
   * Devuelve si el panel está abierto actualmente.
   */
  isOpen(): boolean {
    return !!this._overlayRef;
  }

  /**
   * Registra el input trigger que controlará este autocomplete.
   * Llamado por LibAutocompleteTriggerDirective en ngOnInit.
   *
   * @param {ElementRef<HTMLInputElement>} trigger - Referencia al input nativo.
   */
  registerTrigger(trigger: ElementRef<HTMLInputElement>): void {
    this._triggerRef = trigger;
  }

  /**
   * Abre el panel anclado al trigger.
   */
  openPanel(): void {
    if (this.isOpen() || !this._triggerRef) return;

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
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
      minWidth: this._triggerRef.nativeElement.offsetWidth
    });

    this._overlayRef.backdropClick().subscribe(() => this.closePanel());
    this._overlayRef.keydownEvents().subscribe((e: KeyboardEvent) => {
      if (e.key === 'Escape') this.closePanel();
    });

    const portal: TemplatePortal = new TemplatePortal(this.panelTemplate, this._viewContainerRef);
    this._overlayRef.attach(portal);
    this._cdr.markForCheck();
  }

  /**
   * Cierra el panel sin emitir selección.
   */
  closePanel(): void {
    this._overlayRef?.detach();
    this._overlayRef?.dispose();
    this._overlayRef = null;
    this._activeIndex = -1;
    this._clearActive();
    this._cdr.markForCheck();
  }

  /**
   * Mueve el highlight de teclado.
   * Llamado por LibAutocompleteTriggerDirective en ArrowDown/ArrowUp.
   *
   * @param {1 | -1} direction - Dirección del movimiento.
   */
  moveActive(direction: 1 | -1): void {
    if (!this.isOpen()) {
      this.openPanel();
      return;
    }
    const optArr: LibOptionComponent[] = this._options.toArray();
    let idx: number = this._activeIndex + direction;
    while (idx >= 0 && idx < optArr.length && optArr[idx].isDisabled()) {
      idx += direction;
    }
    if (idx >= 0 && idx < optArr.length) {
      this._setActiveIndex(idx);
    }
  }

  /**
   * Selecciona la opción activa actualmente (si hay alguna).
   * Llamado por LibAutocompleteTriggerDirective en Enter.
   *
   * @returns {boolean} Verdadero si se seleccionó alguna opción.
   */
  selectActive(): boolean {
    const optArr: LibOptionComponent[] = this._options.toArray();
    const active: LibOptionComponent | undefined = optArr[this._activeIndex];
    if (active && !active.isDisabled()) {
      this._emitSelected(active);
      return true;
    }
    return false;
  }

  /**
   * Implementación de LibOptionParent.selectOption —
   * llamado por LibOptionComponent cuando el usuario hace click.
   *
   * @param {LibOptionComponent} option - Opción seleccionada.
   */
  selectOption(option: LibOptionComponent): void {
    this._emitSelected(option);
  }

  // ── Métodos privados ─────────────────────────────────────────────────────────

  /**
   * Establece el índice activo y actualiza el highlight visual.
   *
   * @param {number} idx - Índice de la opción a activar.
   */
  private _setActiveIndex(idx: number): void {
    const optArr: LibOptionComponent[] = this._options.toArray();
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
   * Emite la selección y cierra el panel.
   *
   * @param {LibOptionComponent} option - Opción seleccionada.
   */
  private _emitSelected(option: LibOptionComponent): void {
    this.optionSelected.emit(option.value());
    this.closePanel();
  }
}
