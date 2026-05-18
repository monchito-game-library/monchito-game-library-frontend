import {
  AfterContentInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  DestroyRef,
  inject,
  input,
  InputSignal,
  signal,
  WritableSignal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgControl } from '@angular/forms';
import { RetroInputDirective } from './retro-input.directive';

/**
 * Contenedor de campo de formulario Terminal Collector.
 * Agrupa label, input nativo (con retroInput), mensajes de error y hint.
 * Detecta automáticamente el control proyectado vía @ContentChild(RetroInputDirective)
 * y observa su estado para calcular invalid() y focused().
 *
 * No usa floating label — el label vive siempre encima del campo (decisión TC).
 *
 * Uso:
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
  imports: [],
  templateUrl: './retro-form-field.component.html',
  styleUrl: './retro-form-field.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RetroFormFieldComponent implements AfterContentInit {
  private readonly _cdr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly _destroyRef: DestroyRef = inject(DestroyRef);

  // ── ContentChild privado ─────────────────────────────────────────────────────

  /** Directiva retroInput proyectada dentro de este form-field. */
  @ContentChild(RetroInputDirective)
  private _inputDir?: RetroInputDirective;

  // ── Inputs públicos ──────────────────────────────────────────────────────────

  /** Desactiva visualmente el campo (sin pointer-events, opacidad reducida). */
  readonly disabled: InputSignal<boolean> = input<boolean>(false);

  // ── Signals públicos ────────────────────────────────────────────────────────

  /** Verdadero cuando el input proyectado tiene el foco. */
  readonly focused: WritableSignal<boolean> = signal(false);

  /** Verdadero cuando el control asociado es inválido y ha sido tocado. */
  readonly invalid: WritableSignal<boolean> = signal(false);

  // ── Lifecycle ────────────────────────────────────────────────────────────────

  ngAfterContentInit(): void {
    if (!this._inputDir) return;

    // Suscribirse a focus/blur notificados por la directiva.
    this._inputDir.focusChange$.pipe(takeUntilDestroyed(this._destroyRef)).subscribe((isFocused) => {
      this.focused.set(isFocused);
      this._updateInvalid();
      this._cdr.markForCheck();
    });

    // Leer el NgControl si existe y observar su statusChanges.
    const ngControl: NgControl | null = this._inputDir.ngControl;
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

  // ── Métodos privados ─────────────────────────────────────────────────────────

  /**
   * Actualiza invalid() basándose en el estado del NgControl proyectado.
   * Un campo es inválido si: el control existe, es inválido Y ha sido tocado (o tiene dirty).
   */
  private _updateInvalid(): void {
    const ctrl = this._inputDir?.ngControl?.control;
    if (!ctrl) {
      this.invalid.set(false);
      return;
    }
    this.invalid.set(ctrl.invalid && (ctrl.touched || ctrl.dirty));
  }
}
