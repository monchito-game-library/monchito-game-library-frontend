import { Directive, forwardRef, HostListener, inject } from '@angular/core';
import { NgControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { RETRO_FORM_FIELD_CONTROL, RetroFormFieldControl } from '../../tokens/retro-form-field-control.token';

/**
 * Directiva aplicada a un <input> o <textarea> nativo para integrarlo
 * con RetroFormFieldComponent.
 *
 * Responsabilidades:
 * - Añade la clase CSS `retro-input__control` al host.
 * - Emite focus/blur al RetroFormFieldComponent padre vía `focused$`.
 * - Expone el NgControl del host (si existe) para que el form-field
 *   pueda observar el estado de validación.
 * - Implementa RetroFormFieldControl y provee RETRO_FORM_FIELD_CONTROL
 *   para que RetroFormFieldComponent la descubra sin depender de esta clase.
 *
 * Uso:
 * ```html
 * <input retroInput formControlName="email" type="email" />
 * ```
 *
 * @deprecated El uso de `<textarea retroInput>` desde templates de la app está deprecado.
 * Usar `<retro-textarea>` en su lugar.
 * El selector `textarea[retroInput]` se mantiene para uso interno de `retro-textarea`.
 */
@Directive({
  selector: 'input[retroInput], textarea[retroInput]',
  standalone: true,
  host: {
    class: 'retro-input__control'
  },
  providers: [{ provide: RETRO_FORM_FIELD_CONTROL, useExisting: forwardRef(() => RetroInputDirective) }]
})
export class RetroInputDirective implements RetroFormFieldControl {
  // ── Variables privadas ───────────────────────────────────────────────────────

  private readonly _focusSubject: Subject<boolean> = new Subject<boolean>();

  // ── Variables públicas readonly ──────────────────────────────────────────────

  /** NgControl del elemento host (null si no hay formControlName/ngModel). */
  readonly ngControl: NgControl | null = inject(NgControl, { optional: true, self: true });

  // ── RetroFormFieldControl ────────────────────────────────────────────────────

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
    return this.ngControl?.disabled ?? false;
  }

  /** Verdadero cuando el valor del control está vacío. */
  get empty(): boolean {
    const value = this.ngControl?.value;
    return value === null || value === undefined || value === '';
  }

  // ── Alias interno (retrocompatibilidad con el spec existente) ────────────────

  /**
   * Alias de focused$ para retrocompatibilidad con el spec de RetroInputDirective,
   * que accedía a focusChange$ directamente antes de la introducción del contrato.
   *
   * @deprecated Usar focused$ (RetroFormFieldControl). Se eliminará en Fase 3.
   */
  get focusChange$(): Observable<boolean> {
    return this.focused$;
  }

  // ── Host listeners ───────────────────────────────────────────────────────────

  /** Maneja el evento focus del host. */
  @HostListener('focus')
  onFocus(): void {
    this._focusSubject.next(true);
  }

  /** Maneja el evento blur del host — marca el control como touched (estándar Angular). */
  @HostListener('blur')
  onBlur(): void {
    this._focusSubject.next(false);
    if (this.ngControl?.control) {
      this.ngControl.control.markAsTouched();
    }
  }
}
