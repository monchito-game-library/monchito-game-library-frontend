import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  computed,
  contentChild,
  DestroyRef,
  inject,
  input,
  InputSignal,
  output,
  OutputEmitterRef,
  Signal,
  signal,
  WritableSignal
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RetroIconComponent } from '../retro-icon/retro-icon.component';
import { RETRO_FORM_FIELD_CONTROL, RetroFormFieldControl } from './tokens/retro-form-field-control.token';

/**
 * Contenedor de campo de formulario Terminal Collector.
 * Agrupa label, control proyectado (input, select, search, datepicker…),
 * mensajes de error y hint. Sin floating label.
 *
 * El control proyectado se descubre mediante el token RETRO_FORM_FIELD_CONTROL,
 * que cada inner control (RetroInputDirective, RetroSelectComponent, etc.)
 * debe proveer. Esto desacopla retro-form-field de las implementaciones concretas.
 *
 * Uso con retroInput (API actual — retrocompatible):
 * ```html
 * <retro-form-field>
 *   <retro-label>Título</retro-label>
 *   <input retroInput formControlName="title" />
 *   <retro-error>Campo requerido</retro-error>
 * </retro-form-field>
 * ```
 */
@Component({
  selector: 'retro-form-field',
  standalone: true,
  imports: [RetroIconComponent],
  templateUrl: './retro-form-field.component.html',
  styleUrl: './retro-form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroFormFieldComponent implements AfterContentInit {
  // ── Inyecciones privadas ─────────────────────────────────────────────────────

  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);

  // ── Variables privadas readonly ──────────────────────────────────────────────

  /**
   * Control proyectado dentro de este form-field, descubierto vía
   * RETRO_FORM_FIELD_CONTROL. Puede ser RetroInputDirective, RetroSelectComponent,
   * RetroSearchComponent, RetroDatepickerDirective o cualquier futuro control
   * que implemente RetroFormFieldControl.
   */
  private readonly _contentControl: Signal<RetroFormFieldControl | undefined> =
    contentChild<RetroFormFieldControl>(RETRO_FORM_FIELD_CONTROL);

  /**
   * Control activo: controlRef (self-contained) tiene prioridad sobre contentChild.
   * Computed para que el template reaccione automáticamente.
   */
  private readonly _activeControl: Signal<RetroFormFieldControl | null | undefined> = computed(
    () => this.controlRef() ?? this._contentControl()
  );

  // ── Inputs públicos ──────────────────────────────────────────────────────────

  /**
   * Control inyectado directamente (modo self-contained).
   * Cuando los componentes self-contained (retro-select, retro-input, etc.) usan
   * <retro-form-field> en su template interno, pasan su propia instancia aquí
   * porque no son contenido proyectado.
   * Si se pasa, tiene prioridad sobre contentChild.
   */
  readonly controlRef: InputSignal<RetroFormFieldControl | null> = input<RetroFormFieldControl | null>(null);

  /** Desactiva visualmente el campo (sin pointer-events, opacidad reducida). */
  readonly disabled: InputSignal<boolean> = input<boolean>(false);

  /** Activa el modo multilínea para hosts de tipo textarea. Cambia align-items a stretch y elimina min-height. */
  readonly multiline: InputSignal<boolean> = input<boolean>(false);

  /** Tamaño del campo: sm (32px), md (40px), lg (44px — default). */
  readonly size: InputSignal<'sm' | 'md' | 'lg'> = input<'sm' | 'md' | 'lg'>('lg');

  /** Muestra el botón de limpiar cuando el campo tiene valor. */
  readonly clearable: InputSignal<boolean> = input<boolean>(false);

  /** Texto del aria-label del botón limpiar. */
  readonly clearAriaLabel: InputSignal<string> = input<string>('Limpiar');

  // ── Outputs públicos ─────────────────────────────────────────────────────────

  /** Emite cuando el usuario pulsa el botón limpiar. */
  readonly cleared: OutputEmitterRef<void> = output<void>();

  // ── Signals públicos ────────────────────────────────────────────────────────

  /** Verdadero cuando el control proyectado tiene el foco. */
  readonly focused: WritableSignal<boolean> = signal(false);

  /** Verdadero cuando el control asociado es inválido y ha sido tocado. */
  readonly invalid: WritableSignal<boolean> = signal(false);

  /** Verdadero cuando el control proyectado tiene algún valor (no vacío). */
  readonly hasValue: Signal<boolean> = computed(() => {
    const control: RetroFormFieldControl | null | undefined = this._activeControl();
    return control ? !control.empty : false;
  });

  // ── Métodos públicos ─────────────────────────────────────────────────────────

  /**
   * Emite el output cleared cuando el usuario pulsa el botón limpiar.
   * El componente padre es responsable de resetear el FormControl.
   */
  onClear(): void {
    this.cleared.emit();
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngAfterContentInit(): void {
    this._subscribeToControl();
  }

  // ── Métodos privados ─────────────────────────────────────────────────────────

  /**
   * Se suscribe al control activo (controlRef o contentChild).
   * Gestiona los streams de focus$/blur y statusChanges.
   */
  private _subscribeToControl(): void {
    const control: RetroFormFieldControl | null | undefined = this._activeControl();
    if (!control) return;

    // Suscribirse a focus/blur notificados por el control.
    control.focused$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((isFocused) => {
      this.focused.set(isFocused);
      this._updateInvalid();
      this._cdr.markForCheck();
    });

    // Leer el NgControl si existe y observar su statusChanges.
    // Los controles que implementan RetroFormFieldControl pueden exponer ngControl opcionalmente.
    const ngControl: NgControl | null = control.ngControl ?? null;
    if (ngControl?.statusChanges) {
      ngControl.statusChanges.pipe(takeUntilDestroyed(this._destroyRef)).subscribe(() => {
        this._updateInvalid();
        this._cdr.markForCheck();
      });
    }

    // Calcular estado inicial.
    this._updateInvalid();
    this._cdr.markForCheck();
  }

  /**
   * Actualiza invalid() basándose en el estado del control activo.
   * Usa errorState del contrato RetroFormFieldControl.
   */
  private _updateInvalid(): void {
    const control: RetroFormFieldControl | null | undefined = this._activeControl();
    if (!control) {
      this.invalid.set(false);
      return;
    }
    this.invalid.set(control.errorState);
  }
}
